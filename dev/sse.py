import time
from random import random, randint
import json

SYSTEMS = ["JUPYTER", "JSCCLOUD", "JUWELS", "JURECA", "JUWELS", "JEDI", "JUSUF", "DEEP"]

def generate_usercount() -> dict:
    data = {}
    for system in SYSTEMS:
        users = randint(0, 50)
        if system == "JUPYTER":
            data[system] = users
        else:
            data[system] = {"total": users, "partitions": {"N/A": users}}

    return data

def generate_incidents():
    data = {}
    for system in SYSTEMS:
        health = randint(1, 3) * 10
        if random() < 0.5:
            dates = randint(1, 31), randint(1, 31)
            incident = f"2025-03-{min(dates)}T12:00:00+01:00 - 2025-03-{max(dates)}T12:00:00+01:00:\nSome Maintainance"
        else:
            incident = ""

        data[system] = {"incident": incident, "health": health}

    return data

def get_event_data() -> dict:
    return {
        "usercount": generate_usercount(),
        "incidents": generate_incidents(),
    }

def sse_stream():
    while True:
        data = json.dumps(get_event_data())
        yield f"data: {data}\n\n"
        time.sleep(10.0)