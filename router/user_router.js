//引入
const express = require('express')
const router = express.Router()
const conn = require('../util/sql.js')
const jwt = require('jsonwebtoken')
router.use(express.urlencoded())



const multer = require('multer')
// const upload = multer({dest: 'uploads'})
// 精细化去设置，如何去保存文件
const storage = multer.diskStorage({
    // 保存在哪里
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    // 保存时，文件名叫什么
    filename: function (req, file, cb) {
        // console.log('file', file)
        // 目标： 新名字是时间戳+后缀名
        const filenameArr = file.originalname.split('.');
        // filenameArr.length-1是找到最后一个元素的下标
        const fileName = Date.now() + "." + filenameArr[filenameArr.length - 1]
        cb(null, fileName) //
    }
})

const upload = multer({ storage })
//写接口
// 获取用户的基本信息
router.get('/userinfo', (req, res) => {

    console.log(req.query);

    const { username } = req.query

    const sqlStr = `select * from users where username="${username}"`

    conn.query(sqlStr, (err, result) => {

        console.log(err);
        if (err) {
            res.json({
                status: 500, msg: "服务器错误"
            })
            return
        }

        console.log(result);
        res.json({
            status: 0, msg: "获取用户基本信息成功",
            data: result[0]
        })
    })

})

//更新用户的基本信息
router.post('/userinfo', (req, res) => {
    console.log(req.body);
    const { id, nickname, email, userPic } = req.body

    // const sqlStrSelect = `update users set nickname="${nickname}",email="${email}",userPic="${userPic}"  where id="${id}"`
    const sqlStr = `update users set nickname="${nickname}",email="${email}",userPic="${userPic}" where id="${id}" `
    conn.query(sqlStr, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ msg: '更新失败', status: 500 })


        }
        res.json({ msg: '修改成功', status: 0 })
    })
})

//上传用户头像
router.post('/uploadPic', upload.single('file_data'), (req, res) => {
    // 如果文件上传成功
    console.log('本次上传的文件是', req.file)
    // 后面再做：错误处理
    res.json({
        "code": 200,
        "msg": "上传成功",
        "src": "http://127.0.0.1:3000/uploads/" + req.file.filename
    })
})

//密码重置
router.post('/updatepwd', (req, res) => {
    const { id, oldPwd, newPwd } = req.body

    const sqlStr = `select password from users where id="${id}" `
    conn.query(sqlStr, (err, result) => {
        if (err) {
            console.log(err);
            
            res.json({ status: 500, msg: '错误' })
            return
        } if (result[0].password != oldPwd) {
            res.json({ status: 1, msg: '旧密码错误' })
            return

        }
        const sqlStrSelect = `update users set pasword="${newPwd}" where id="${id}"`
        conn.query(sqlStrSelect, (err, result) => {
            // 说明查询出错
            if (err) {
                console.log(err)
                res.json({ status: 500, msg: "服务器错误" })
                return
            }

            res.json({
                status: 0, msg: "更新密码成功"
            })
        })
    })

})
module.exports = router
