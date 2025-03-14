from json import loads
from pathlib import Path

from flask import Flask, render_template, redirect, send_file

HERE = Path(__file__).parent


def static_url(path: str, include_version=False) -> str:
    return f"/dist/{path}"


app = Flask(
    __name__,
    static_url_path="/dist", static_folder=HERE.parent / "dist",
    template_folder=HERE.parent / "dist" / "templates"
)
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
    return "/dist/images/favicon.svg"

@app.route("/assets/<path>")
def assets(path):
    return send_file(HERE.parent / f"dist/assets/{path}")

@app.route("/<path>")
def templates(path):
    return render_template(path)
