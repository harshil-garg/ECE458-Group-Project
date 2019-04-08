from flask import Flask
from flask import jsonify
from flask import request
import json
import scheduler
app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def pee():
    success = False
    data = []
    message = None
    
    try:
        content = request.get_json()
    except:
        message = "JSON was not parseable"
        return send(success, data, message) 

    try:
        schedule = scheduler.makeSchedule(content)
    except:
        message = "Scheduler library unable to make schedule"
        return send(success, data, message) 
    
    try:
        data = [{"task": str(t[0]), "resource": str(t[1]), "start": t[2], "end": t[3]} for t in schedule]
        success = True
        message = "Schedule created successfully"
    except:
        message = "Response JSON was not correctly indexed"
        return send(success, [], message)

    return send(success, data, message)

def send(success, data, message):
    response = {
        "success": success,
        "data": data,
        "message": message
    }
    return app.response_class(
        response=json.dumps(response),
        status=200,
        mimetype='application/json'
    )

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')