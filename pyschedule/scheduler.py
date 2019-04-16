from pyschedule import Scenario, solvers, plotters, alt

def makeSchedule(content):
    horizon = content["horizon"]

    # Define all the players
    MyScenario = Scenario('manufacturing_schedule', horizon=horizon)
    MyResources = {}
    MyTasks = {}

    # Define the resources (manufacturing lines)
    lines = content["lines"]
    for line in lines:
        MyResources[line] = MyScenario.Resource(str(line))

    # Define tasks which are already present which must remain in the same location
    # Known as blocking tasks
    blocks = content["blocks"]
    for block in blocks:
        blockid = str(block["goal_name"] + "_" + str(block["sku_number"]))
        line = block["line_name"]
        start = block["start"]
        end = block["end"]

        # Create task and add the resource that will execute it
        task = MyScenario.Task(blockid, length=end-start)
        task += MyResources[line]

        # Define the bounds
        MyScenario += task > start, task < end

    # New tasks which must be scheduled
    tasks = content["tasks"]
    for task in tasks:
        taskid = str(task["goal_name"] + "_" + str(task["sku_number"]))
        duration = task["duration"]
        line_names = task["line_names"]
        deadline = task["deadline"]
        print(deadline)
        print(type(deadline))
        t = MyScenario.Task(taskid, length=duration, delay_cost=1)

        resources = MyResources[line_names[0]]
        for i in range(1, len(line_names)):
            resources = resources | MyResources[line_names[i]]
        t += resources

        MyScenario += t >= 0, t <= deadline
    
    solvers.mip.solve(MyScenario,msg=1)
    plotters.matplotlib.plot(MyScenario,img_filename='household.png')
    return MyScenario.solution()
    

