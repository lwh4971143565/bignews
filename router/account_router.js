//引入
const express = require('express')
const router = express.Router()
const conn = require('../util/sql.js')
const jwt = require('jsonwebtoken')
router.use(express.urlencoded())


// 1.0 注册用户
router.post('/register', (req, res) => {
    // 1. 获取用户名和密码 
    //   console.log('收到的参数是：', req.body)
    const { username, password } = req.body
    // 2. 根据注册业务的要求，先去看一下名字有没有占用！
    //    根据用户名去做一次查询 如果找到了结果，说明名字被占用了，如果查询结果为空，说明
    //    名字可以使用
    const sqlStrSelect = `select username from users where username="${username}"`
    conn.query(sqlStrSelect, (err, result) => {
        // 说明查询出错
        if (err) {
            console.log(err)
            res.json({ status: 500, msg: "服务器错误" })
            return
        }
        console.log(result)
        // 说明名字被占用了
        if (result.length > 0) {
            res.json({ status: 1, msg: "注册失败，名字占用了" })
            return
        }
        // 说明没有占用，继续做添加
        // 3. 拼接sql， 添加到数据表中
        const sqlStr = `insert into users (username,password) values ("${username}","${password}")`
        // console.log(sqlStr)
        // 4. 执行sql操作数据库
        conn.query(sqlStr, (err, result) => {
            console.log(err)
            console.log(result)
            if (err) {
                res.json({ status: 500, msg: "服务器错误" })
                return
            }
            // 5. 根据操作结果，做不同的响应
            res.json({ status: 0, msg: '注册成功' })
        })
    })
})


//登录

router.post('/login', (req, res) => {
    //接收数据 //解构参数
    console.log(req.body);
    const { username, password } = req.body
    // 拼接sql

    // const sqlStr = `select * from users username="${username}" and password ="${password}" `
    const sqlStr = `select * from users where username="${username}" and password="${password}"`

    // console.log(sqlStr);
    // 操作数据
    conn.query(sqlStr, (err, result) => {
        // 4. 根据结果进行返回 
        if (err) {
            console.log(err)
            res.json({ msg: '服务器错误', status: 500 })
            return
        }
        console.log("查询结果", result)
        if (result.length > 0) {
            // 查找到了，说明登陆成功
            // 返回token
            //   const token ='Bearer '+ jwt.sign(
            const token ='Bearer '+  jwt.sign(
                { name: username },
                'gz61',  // 加密的密码，要与express-jwt中的验证密码一致
                { expiresIn: 2 * 60 * 60 } // 过期时间，单位是秒
            )
            // token =+ 'Bearer' 
            console.log(token);
            
            res.json({ msg: "登陆成功", status: 0, token })
        } else {
            res.json({ msg: "登陆失败，用户名密码不对", status: 1 })
        }
    })
    // 返回结果
})
module.exports = router