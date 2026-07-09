from flask import Flask, render_template, session, jsonify
import random

app = Flask(__name__)
app.secret_key = "please-change-this-to-something-random"  # 部署前記得改掉

# 進化鏈設定:8 個階段,越後面機率越低(前期爽、後期有成就感)
STAGES = [
    {"name": "嫩樹枝",     "emoji": "🌿", "chance": 0.35},
    {"name": "粗木棒",     "emoji": "🪵", "chance": 0.30},
    {"name": "石斧",       "emoji": "🪨", "chance": 0.25},
    {"name": "銅劍",       "emoji": "🗡️", "chance": 0.20},
    {"name": "鐵劍",       "emoji": "⚔️", "chance": 0.15},
    {"name": "三叉戟",     "emoji": "🔱", "chance": 0.10},
    {"name": "雷神之錘",   "emoji": "⚡", "chance": 0.05},
    {"name": "傳說神器",   "emoji": "👑", "chance": 0.0},   # 最高階,不再升級
]

MAX_LEVEL = len(STAGES) - 1


@app.route("/")
def index():
    # 每次重新整理頁面就重置進度(單純demo用,想保留進度可以改用資料庫)
    session["level"] = 0
    session["clicks"] = 0
    return render_template("index.html", stages=STAGES, max_level=MAX_LEVEL)


@app.route("/click", methods=["POST"])
def click():
    """
    這支路由就是作業要求的「python 計算程式」核心：
    - 用 random 判斷這次點擊是否升級
    - 用 session 記錄目前等級與點擊次數(伺服器端狀態,不是前端亂算)
    """
    level = session.get("level", 0)
    clicks = session.get("clicks", 0) + 1
    session["clicks"] = clicks

    leveled_up = False

    if level < MAX_LEVEL:
        chance = STAGES[level]["chance"]
        if random.random() < chance:
            level += 1
            leveled_up = True
            session["level"] = level

    stage = STAGES[level]

    return jsonify({
        "leveled_up": leveled_up,
        "level": level,
        "max_level": MAX_LEVEL,
        "name": stage["name"],
        "emoji": stage["emoji"],
        "clicks": clicks,
        "is_max": level == MAX_LEVEL,
    })


if __name__ == "__main__":
    # host="0.0.0.0" 讓同一個 WiFi 下的手機也能連到這台電腦測試
    # 正式部署到 Render 後這行不會被用到(Render 是用 gunicorn 啟動)
    app.run(host="0.0.0.0", port=5000, debug=True)
