require('dotenv').config();
const streamChatCompletion = require("./streamChatCompletion").streamChatCompletion;

var express = require("express");
const cors = require('cors')

var app = express();

app.use(express.json());
app.use(cors());

var server = app.listen(4401, function () {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.post('/', async (req, res) => {
    console.log(req.body)
    query = req.body

    let category = query.category
    let people = query.people
    let activity = query.activity
    let grade = query.grade
    let period = query.period
    let mean = query.mean
    let departure = query.departure
    let stay = query.stay
    let money = query.money

    if (category != "一人") {
        category = category + people + "人";
    }

    let prompt = "あなたは旅行代理店の社員です。\n" +
        "お客様が" + category + "でこの夏休みに夏を堪能できるような旅行をしたいという提案を受けました。\n" +
        "お客様の要望を叶えつつ、予算を超えない金額で旅行プランを考案してください。\n" +
        "お客様が旅でやりたいアクティビティは、" + activity + "で、お客様は" + grade + "を希望しています。\n" +
        departure + "から" + activity + "が出来る場所まで" + mean + "での移動を希望しています。\n" +
        "お客様は" + stay + "を希望しています。\n";
    if (stay == "宿泊") {
        prompt = prompt + "宿泊場所は" + grade + "での宿泊を希望しており、宿泊日数は" + period + "泊です。\n";
    }

    prompt = prompt + "お客様の提示された予算は交通費、宿泊費、アクティビティ代を" + people + "人分すべて含めて" + money + "円です。\n" +
        "お客様の要望を叶えつつ、予算を超えない金額で実在する交通網、具体的で実在する場所、実在する旅館・ホテルで具体的な旅行プラン各日ごと考案してください。\n" +
        "交通網を作成する際には現実には存在しえないダイヤや行先は指定しないでください。\n" +
        "ただし、提示された金額でプランの作成が不可能な際はプランを作成せず、提示された金額では難しいという旨をお客様にお伝えください。\n" +
        "また、金額については日程などによっては変動する恐れがあるという注意書きを最後にしてください。\n" +
        "\n" +
        "返答のフォーマットは以下の通りです。\n" +
        "旅行プランフォーマット:\n" +
        "[日程]\n" +
        "出発日: [出発日付]\n" +
        "帰国日: [帰国日付]\n" +
        "[出発場所]\n" +
        "場所: [出発場所名]\n" +
        "[目的地]\n" +
        "場所: [目的地名]\n" +
        "[アクティビティ]\n" +
        "...\n" +
        "[交通手段]\n" +
        "往復: [交通手段・便名・出発時刻・到着時刻]\n" +
        "現地移動: [交通手段・利用予定のルート]\n" +
        "[宿泊先]\n" +
        "...\n" +
        "[予算]\n";


    const { Configuration, OpenAIApi } = require("openai");
    const OPENAI_API_KEY = "";

    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    try {
        for await (const data of streamChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "system", "content": "You are a helpful assistant." }, { role: "user", content: prompt }]
        })) {
            res.write(data);
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({ message: "Internal server error" });
    }
    res.end();
});

