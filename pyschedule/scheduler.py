from pyschedule import Scenario, solvers, plotters, alt

def makeSchedule(content):
    horizon = content["horizon"]
    print(horizon)
    # Define all the players
    MyScenario = Scenario('manufacturing_schedule', horizon=horizon)
    MyResources = {}
    MyTasks = {}

    # Define the resources (manufacturing lines)
    manufacturing_lines = content["manufacturing_lines"]
    print(manufacturing_lines)
    for manufacturing_line in manufacturing_lines:
        MyResources[manufacturing_line] = MyScenario.Resource(str(manufacturing_line))

    # Define tasks which are already present which must remain in the same location
    # Known as blocking tasks
    blocks = content["blocks"]
    print(blocks)
    for block in blocks:
        blockid = str(block["goal_name"] + "_" + str(block["sku_number"]))
        manufacturing_line_name = block["manufacturing_line_name"]
        start = block["start"]
        end = block["end"]

        # Create task and add the resource that will execute it
        task = MyScenario.Task(blockid, length=end-start)
        task += MyResources[manufacturing_line_name]

        # Define the bounds
        MyScenario += task > start, task < end

    # New tasks which must be scheduled
    tasks = content["tasks"]
    print(tasks)
    for task in tasks:
        taskid = str(task["goal_name"] + "_" + str(task["sku_number"]))
        duration = task["duration"]
        manufacturing_line_names = task["manufacturing_line_names"]
        deadline = task["deadline"]

        t = MyScenario.Task(taskid, length=duration, delay_cost=1)

        resources = MyResources[manufacturing_line_names[0]]
        for i in range(1, len(manufacturing_line_names)):
            resources = resources | MyResources[manufacturing_line_names[i]]
        t += resources

        MyScenario += t > 0, t < deadline
    
    solvers.mip.solve(MyScenario,msg=1)
    plotters.matplotlib.plot(MyScenario,img_filename='household.png')
    return MyScenario.solution()
    

