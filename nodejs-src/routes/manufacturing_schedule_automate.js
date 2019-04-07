// Core dependencies
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const axios = require('axios');

// Schemas and models
const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const ManufacturingSchedule = require('../model/manufacturing_schedule_model');
const ManufacturingLine = require('../model/manufacturing_line_model');

// Utilities
const PriorityQueue = require('../utils/priority_queue')

router.post('/naive', async(req, res) => {
    return await automate_naive(req, res);
});

async function automate_naive(req, res) {
    let { activities, start_, end_ } = req.body;

    let start = moment(start_).tz("America/New_York")
    let end = moment(end_).tz("America/New_York")
    console.log(`The start date in EST is ${start.format()} and the end date in EST is ${end.format()}.`);

    let pq = makePriorityQueue();
    for (let activity of activities) {
        let t = await processActivity(activity);
        pq.push(t);
    }
    
    while (true) {
        let task = pq.pop();
        if (!task) break;
        let schedulable = false;
        let earliestStartTime = moment(end);
        let bestLine;
        for (let line of task.sku.manufacturing_lines) {
            let schedulableOnLine = false;
            let preExistingActivities = await ManufacturingSchedule.find({
                manufacturing_line: line
            });

            let interval = skipToWorkingHours(moment(start), calculateEndTime(moment(start), task.duration), task.duration);
            while (interval.end <= end) {
                interval = skipToWorkingHours(interval.start, interval.end, task.duration);
                let conflict = false;
                for (let preExistingActivity of preExistingActivities) {
                    let otherStart = moment(preExistingActivity.start_date).tz("America/New_York");
                    let otherEnd = calculateEndTime(otherStart, preExistingActivity.duration);
                    if (interval.start < otherEnd && interval.end > otherStart) {
                        conflict = true;
                        break;
                    }
                }
                if (conflict) {
                    interval.start = interval.start.add(1, 'hours');
                    interval.end = calculateEndTime(interval.start, task.duration);
                } else {
                    schedulable = true;
                    schedulableOnLine = true;
                    break;
                }
            }
            if (schedulableOnLine) {
                if (interval.start < earliestStartTime) {
                    earliestStartTime = interval.start;
                    bestLine = line;
                }
            }
        }
        if (!schedulable) {
            return res.json({
                success: false,
                message: `Some activities may have been added, but ${task.sku.name + ' (' + task.goal.name + ')'} cannot be scheduled`
            })
        } else {
            // Schedule the activity
            let mapping = new ManufacturingSchedule({
                activity: {
                    sku: task.sku._id,
                    manufacturing_goal: task.goal._id
                },
                manufacturing_line: bestLine,
                start_date: moment.utc(earliestStartTime).format(), 
                duration: task.duration, 
                duration_override: false
            });
            await ManufacturingSchedule.create(mapping);
        }
    }

    res.json({
        success: true,
        message: "Automation of all activities successful"
    });
}

function makePriorityQueue() {
    return new PriorityQueue([], function(a, b) {
        if (a.deadline < b.deadline) {
            return -1;
        } else if (a.deadline > b.deadline) {
            return 1;
        } else {
            return a.duration - b.duration;
        }
    });
}

async function processActivity(activity) {
    let sku = await SKU.findOne({number: activity.sku}).exec();
    let goal = await ManufacturingGoal.findOne({name: activity.manufacturing_goal}).exec();
    let quantity = 0;
    for (let tuple of goal.sku_tuples) {
        if (tuple.sku.equals(sku._id)) {
            quantity = tuple.case_quantity;
        }
    }
    let duration = Math.ceil(quantity / sku.manufacturing_rate);
    return {
        sku: sku,
        goal: goal,
        duration: duration,
        deadline: moment(goal.deadline).tz('America/New_York').startOf('hour')
    };
}

function skipToWorkingHours(start, end, taskDuration) {
    start = moment(start)
    while (start.hours() < 8 || start.hours() >= 18) {
        start = start.add(1, 'hours');
        end = calculateEndTime(start, taskDuration);
    }
    return {
        start: start,
        end: end
    }
}

function calculateEndTime(start, duration) {
    let end = moment(start);
    var hoursToSixPM = 18 - start.hours();
    if (hoursToSixPM >= duration){
        end.add(duration, 'hours');
    } else {
        end.add(1, 'days');
        duration -= hoursToSixPM;
        while (duration > 10) {
            end.add(1, 'days');
            duration -= 10;
        }
        end.hours(8 + duration);
    }
    return end;
}

router.post('/complex', async(req, res) => {
    let { activities, start_, end_} = req.body;

    let start = moment(start_).tz("America/New_York")
    let end = moment(end_).tz("America/New_York")
    console.log(`The start date in EST is ${start.format()} and the end date in EST is ${end.format()}.`);

    let periods = mapTime(start, end);
    let horizon = periods.length;
    let intervalStart = periods[0];
    let intervalEnd = periods[horizon - 1];

    for (let period of periods) {
        console.log(period.format());
    }
    console.log(horizon);

    let blocks = [];
    let lines = await ManufacturingLine.find({});
    for (let line of lines) {
        let tasks = await ManufacturingSchedule.find({
            manufacturing_line: line
        });
        for (let task of tasks) {
            let taskStart = moment(task.start_date).tz("America/New_York");
            let taskEnd = calculateEndTime(taskStart, task.duration);
            if (taskStart < intervalEnd && taskEnd > intervalStart) {
                console.log(taskStart.format());
                console.log(taskEnd.format());
                let s = moment.max(taskStart, intervalStart);
                let e = moment.min(taskEnd, intervalEnd);

                // From s to e, we must find the position(s) in the periods array
                let s_index = getIndex(s, periods);
                let e_index = getIndex(e, periods);
                console.log(task);
                let sku = await SKU.findOne({
                    _id: task.activity.sku
                });
                let goal = await ManufacturingGoal.findOne({
                    _id: task.activity.manufacturing_goal
                });
                blocks.push({
                    sku_number: sku.number,
                    goal_name: goal.name,
                    line_name: line.name,
                    start: s_index,
                    end: e_index
                });
            }
        }
    }

    let tasks = [];
    for (let activity of activities) {
        let processedActivity = await processActivity(activity);
        let lineNames = [];
        for (let lineID of processedActivity.sku.manufacturing_lines) {
            let line = await ManufacturingLine.findOne({_id: lineID});
            lineNames.push(line.name);
        }
    
        tasks.push({
            sku_number: processedActivity.sku.number,
            goal_name: processedActivity.goal.name,
            duration: processedActivity.duration,
            line_names: lineNames
        });
    }

    let axios_error, response;
    [axios_error, response] = await to(
        axios.post(
            'http://vcm-8670.vm.duke.edu:5000', 
            {
                blocks: blocks,
                tasks: tasks,
                horizon: horizon,
                lines: lines.map(line => line.name)
            }, 
            { 
                headers: {  
                    'mimetype': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )
    );
    
    if (axios_error || !response.data.success) {
        console.log(`Python scheduler failed with message: ${response.data.message}`)
        return await automate_naive(req, res);
    } else {
        console.log(response.data.data);
        let scheduling_result = await transformSchedule(response.data.data, periods);
        if (scheduling_result.success) {
            return res.json(scheduling_result);
        } else {
            return await automate_naive(req, res);
        }
    }
});

async function transformSchedule(schedule, times) {
    let mappings = [];
    for (let s of schedule) {
        if (s.task == 'MakeSpan') continue;

        let goal_name, sku_number, resource, start, end;

        goal_name = s.task.split("_")[0];
        sku_number = s.task.split("_")[1];
        resource = s.resource;
        start = times[s.start];
        end = times[s.end];

        if (!end) {
            return {
                success: false,
                message: "Scheduler could not fit the activities and had overflow, must use naive method"
            }
        }

        let manufacturing_goal, sku, manufacturing_line, duration, duration_override;
        
        manufacturing_goal = await ManufacturingGoal.findOne({name: goal_name});
        sku = await SKU.findOne({number: sku_number});
        manufacturing_line = await ManufacturingLine.findOne({name: resource});
        duration = s.end - s.start;
        duration_override = false;

        let mapping = new ManufacturingSchedule({
            activity: {
                sku: sku._id,
                manufacturing_goal: manufacturing_goal._id
            },
            manufacturing_line: manufacturing_line._id,
            start_date: moment.utc(start).format(), 
            duration: duration, 
            duration_override: duration_override
        });
        console.log(mapping);
        mappings.push(mapping);
    }

    for (let mapping of mappings) {
        await ManufacturingSchedule.create(mapping);
    }

    return {
        success: true,
        message: "Complex scheduling was successful"
    }
}

function mapTime(start, end) {
    let a = moment(start);
    let b = moment(end);

    // Set start time to 8AM if it is 6PM-7AM
    if (a.hours() >= 18) {
        a.add(1, 'days').hours(8);
    } else if (a.hours() < 8) {
        a.hours(8);
    }

    // Set end time to 6PM if the end time is 7PM-8AM
    if (b.hours() > 18) {
        b.hours(18);
    } else if (b.hours() <= 8) {
        b.subtract(1, 'days').hours(18);
    }
    
    let list = [];
    while (a < b) {
        if (a.hours() == 18) {
            a.add(1, 'days').hours(8);
        }
        list.push(moment(a));
        a.add(1, 'hours');
    }
    list.push(moment(b));
    
    return list;
}

function getIndex(time, periods) {
    let index = 0;
    for (let period of periods) {
        if (period.isSame(time)) {
            return index;
        }
        index++;
    }
    return -1;
}

function to(promise) {
    return promise.then(data => {
       return [null, data];
    })
    .catch(err => [err]);
 }

module.exports = router;