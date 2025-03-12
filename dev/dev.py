from json import loads
from pathlib import Path

from flask import Flask, render_template, redirect

HERE = Path(__file__).parent


def static_url(path: str, include_version=False) -> str:
    return f"/static/{path}"


app = Flask(__name__, static_folder=HERE.parent / "static", template_folder=HERE.parent / "templates")
app.jinja_env.add_extension("jinja2.ext.do")
app.jinja_env.globals["static_url"] = static_url
app.jinja_env.globals["frontendCollection"] = loads((HERE / "frontendCollectionUser.json").read_bytes())
app.jinja_env.globals["auth_state"] = loads((HERE / "auth_state.json").read_bytes())
app.jinja_env.globals["user"] = loads((HERE / "user.json").read_bytes())


@app.route("/")
def root():
    return redirect("/home.html")


@app.route("/favicon.ico")
def favicon():
    return "/static/images/favicon.svg"


@app.route("/<path>")
def templates(path):
    return render_template(path)
