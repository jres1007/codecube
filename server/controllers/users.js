const models = require('../models')
const { users } = require('../models')
const { makejwt, solveToken } = require('./function')
const whoRU = function (withBearer) {
  const token = withBearer.split(' ')[1]
  const userInfo = solveToken(token)
  return userInfo
}
const { Op } = require('sequelize')
const lodash = require('lodash')
const { isFunction } = require('lodash')

module.exports = {
  users: {
    get: async (req, res) => {
      const rtoken = req.cookies.jwt
      const decoded = whoRU(rtoken)

      // 혹시 문제있으면 이거 사용
      // const decoded = solveToken(rtoken)
      //

      const solve = await users.findOne({
        raw: true,
        where: { username: decoded.username },
      })
      const userInfo = solve
      const { id, email, username, image, description, createdAt, updatedAt } =
        userInfo
      const userData = {
        id,
        email,
        username,
        image,
        description,
        createdAt,
        updatedAt,
      }

      //token이 만료되거나 유저정보에 없으면

      let stacklist = await models.user_stacks.findAll({
        raw: true,
        where: { userId: solve.id },
      })
      stacklist = stacklist.map((el) => el.stackId)

      if (!solve) {
        res.status(401).json({ message: 'invalid authorization' })
      }
      //아니면 유저정보를 보내준다.
      else {
        if (stacklist.length !== 0) {
          const stacks = await models.stacks.findAll({
            raw: true,
            attributes: ['id', 'name'],
            where: {
              id: {
                [Op.or]: stacklist,
              },
            },
          })
          solve.stacks = stacks
        } else {
          solve.stacks = []
        }

        console.log(solve)
        res.status(200).json({ data: solve })
      }
    },
    //회원탈퇴
    delete: async (req, res) => {
      const Token = req.cookies.jwt
      const userInfo = whoRU(Token)

      if (!userInfo) {
        res.status(401).json({ message: 'no such info' })
      } else {
        if (userInfo.stacks.length) {
          await models.user_stacks.destroy({ where: { userId: userInfo.id } })
        }
        await models.users.destroy({ where: { id: userInfo.id } })
        res.clearCookie('id')
        res.status(200).clearCookie('jwt').json({ message: 'byebye' })
      }
    },
  },
  changeinfo: {
    put: async (req, res) => {
      const token = req.cookies.jwt
      const newInfo = req.body
      // console.log(newInfo)

      //요청정보가 없을시
      if (!newInfo) {
        res.status(400).json({ message: 'invalid userinfo' })
      }
      //Token으로 사용자의 현재 정보를 찾는다.
      const userId = whoRU(token).id
      // console.log(userId)
      //access Token이 만료될 경우
      if (!userId) {
        res.status(401).json({ message: 'invalid authorization' })
      } else {
        //user 정보 업데아트
        await models.user_stacks.destroy({ where: { userId } })

        const stackobj = {}
        const newarr = []
        if (newInfo.stacks.length !== 0) {
          newInfo.stacks.forEach((el) => {
            stackobj['userId'] = userId
            stackobj['stackId'] = el
            let element = lodash.cloneDeep(stackobj)
            newarr.push(element)
          })
          await models.user_stacks.bulkCreate(newarr)
        }
        await models.users.update(newInfo, {
          where: {
            id: userId,
          },
        })
        const solve = await users.findOne({
          raw: true,
          where: { id: userId },
        })
        res.status(200).json({
          userInfo: solve,
          message: 'successfully modified',
        })
      }
    },
  },
  logout: {
    get: async (req, res) => {
      res
        .status(205)
        .clearCookie('jwt')
        .clearCookie('id')
        .send('Logged out successfully')
    },
  },
  signup: {
    post: async (req, res) => {
      console.log('요청들어온거', req.body)
      const { username, email, description, image, password, stacks } = req.body

      const Idtrue = await models.users.findOne({
        raw: true,
        attributes: ['email'],
        where: { email: email },
      })

      if (!Idtrue) {
        await models.users.create({
          username: username,
          email: email,
          password: password,
          description: description,
          image: image,
        })

        const userInfo = await models.users.findOne({
          raw: true,
          where: { username: username },
        })

        const stackobj = {}
        const newarr = []
        if (stacks.length !== 0) {
          stacks.forEach((el) => {
            stackobj['userId'] = userInfo.id
            stackobj['stackId'] = el
            let element = lodash.cloneDeep(stackobj)
            newarr.push(element)
            // stacks = newarr
          })
          await models.user_stacks.bulkCreate(newarr)
        }
        const uId = userInfo.id
        console.log(uId)
        const jwt = makejwt({ uId, username, email, description })

        res
          .cookie('id', uId)
          .cookie('jwt', `bearer ${jwt}`, {
            //             sameSite: 'None',
            httpOnly: true,
            //             secure: true,
          })
          .status(201)
          .json({ message: 'signup successed' })
      } else {
        res.status(400).json({ message: '이미 있는 아이디 입니다' })
      }
    },
  },
  login: {
    post: async (req, res) => {
      // body에 아이디하고 비밀번호를 확인
      const userInfo = req.body
      // console.log('서버쪽 곤솤르돌', userInfo)
      const { email, password } = userInfo
      // loginuser 변수에 DB에서 회원정보 유무를 확인하여 존재시 변수에 할당
      const loginuser = await models.users.findOne({
        raw: true,
        where: {
          email: email,
          password: password,
        },
      })
      console.log(loginuser)
      const target = loginuser
      //DB에 유저 정보가 없을시
      if (!target) {
        res.status(400).json({ message: 'login unsuccessed' })
      }
      //DB에 유저정보가 있을시 jwt토큰을 cookie에 담아서보내줌
      else {
        let stacks = await models.user_stacks.findAll({
          raw: true,
          where: { userId: target.id },
        })
        stacks = stacks.map((el) => el.stackId)
        const { username, email, description, id } = target
        const jwt = makejwt({ id, username, email, description, stacks })

        res
          .cookie('jwt', `bearer ${jwt}`, {
            // sameSite: 'None',
            // secure: true,
            httpOnly: true,
          })
          .cookie('id', id, {
            // sameSite: 'None',
            // secure: true,
            httpOnly: true,
          })
          .status(200)
          .json({
            message: 'login successed',
            // data: { authorization: jwt },
          })
      }
    },
  },
}
