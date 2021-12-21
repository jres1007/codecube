import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import Board from './section/board/board'

import Mypage from './section/login_profile/mypage'
import Login from './section/login_profile/login'
import Signup from './section/login_profile/signup'
import GitContribution from './section/gitcontribution/gitContri'
import GitContributionUser from './section/gitcontribution/gitContriUser'
import NoticeBoard from './section/noticeboard/noticeBoard'
import axios from 'axios'
require('dotenv').config()
const client_id = process.env.GITHUB_CLIENT_ID
const client_secret = process.env.GITHUB_CLIENT_SECRET

function App() {
  const [isLoggedIn, setisLoggedIn] = useState(false)
  const [userinfo, setUserinfo] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const navigate = useNavigate()

  const isAuthenticated = async (data) => {
    // TODO: 이제 인증은 성공했습니다. 사용자 정보를 호출하고, 이에 성공하면 로그인 상태를 바꿉시다.
    await axios
      .get('http://localhost:4000/users', {
        headers: { authorization: `bearer ${data}` },
      })
      .then((res) => {
        console.log('인증받으면 서버로부터 어떤 데이터 받아오는거임?', res.data.data)
        /*
      await axios.get('http://localhost:4000/users', { headers: { authorization: `bearer ${accessToken}`, }, })
      et response = await axios.get('https://api.github.com/user', { headers: { authorization: `token ${accessToken}`, }, })
    let response = await axios.get('https://api.github.com/user', { headers: { authorization: `token ${accessToken}`, }, })

      인증받으면 서버로부터 어떤 데이터 받아오는거임? {data: {…}, status: 200, statusText: 'OK', headers: {…}, config: {…}, …}config: {url: 'https://localhost:4000/auth', method: 'get', headers: {…}, transformRequest: Array(1), transformResponse: Array(1), …}data: data: userInfo: {id: 3, email: 'tt@naver.com', username: '킴코', mobile: '198165102', createdAt: '2021-12-08', …}[[Prototype]]: Objectmessage: "ok"[[Prototype]]: Objectheaders: {content-length: '159', content-type: 'application/json; charset=utf-8'}request: XMLHttpRequest {readyState: 4, timeout: 0, withCredentials: true, upload: XMLHttpRequestUpload, onreadystatechange: ƒ, …}status: 200statusText: "OK"[[Prototype]]: Object
      data:
          data:
            userInfo: {id: 3, email: 'tt@naver.com', username: '킴코', mobile: '198165102', createdAt: '2021-12-08', …}
            [[Prototype]]: Object
          message: "ok"
      */
        // 서버실행시키고 크롬개발자도구에서 확인가능
        //res.status(200).json({data:{userInfo: data.dataValues}, message: 'ok'}) 패스워드 뺀 데이터 받아올듯
        setUserinfo(res.data.data)
        setisLoggedIn(true)
        // navigate('/')
        // 일단 /로간다음 로그인상태에따라서 분기 나눠준다
      })
  }

  // const handleResponseSuccess = () => {
  //   console.log('살려주오...!!!.', token)
  //   isAuthenticated()
  //   // setisLoggedIn(true)
  //   // navigate('/')
  // }

  /*
  ×
Unhandled Rejection (TypeError): Cannot destructure property 'username' of 'props.userinfo' as it is null.
  */

  const handleLogout = () => {
    axios.get('http://localhost:4000/logout').then((res) => {
      console.log('메세지가뭐야???', res)
      setUserinfo('')
      setisLoggedIn(false)
      navigate('/')
      // window.location.replace('/')
    })
  }

  const handleEdit = () => {
    // axios.put('https://localhost:4000/').then((res) => {
    //   setUserinfo(null)
    //   setisLoggedIn(true)
    //   navigate('/')
    // })
    setUserinfo(null)
    setisLoggedIn(true)
    navigate('/')
  }

  const handleSignup = () => {
    setSignupButton(true)
    navigate('/')
  }

  useEffect(() => {
    isAuthenticated()
  }, [])

  const gitloginhandler = async () => {
    // await axios.post('http://localhost:4000/github/callback').then((res) => {
    //   console.log(res.data)
    // })
    window.location.assign(
      'https://github.com/login/oauth/authorize?client_id=' + client_id
    )
    redirectUri: 'http://localhost:3000'
  }

  function componentDidMount() {
    const url = new URL(window.location.href)
    const authorizationCode = url.searchParams.get('code')
    if (authorizationCode) {
      // authorization server로부터 클라이언트로 리디렉션된 경우, authorization code가 함께 전달됩니다.
      // ex) http://localhost:3000/?code=5e52fb85d6a1ed46a51f
      this.getAccessToken(authorizationCode)
    }
  }
  componentDidMount()

  return (
    <div id="container">
      <div className="col w40">
        <div className="login">
          {isLoggedIn ? (
            <Mypage
              userinfo={userinfo}
              handleLogout={handleLogout}
              setUserinfo={setUserinfo}
              setisLoggedIn={setisLoggedIn}
              isAuthenticated={isAuthenticated}
              // handleEdit={handleEdit}
            />
          ) : isSignup ? (
            <Signup
              setUserinfo={setUserinfo}
              userinfo={userinfo}
              setIsSignup={setIsSignup}
            />
          ) : (
            <Login
              setisLoggedIn={setisLoggedIn}
              setUserinfo={setUserinfo}
              setIsSignup={setIsSignup}
              isAuthenticated={isAuthenticated}
              gitloginhandler={gitloginhandler}
            />
          )}
        </div>
        <div></div>
      </div>
      <div className="col w30">
        <div className="row h50">
          {isLoggedIn ? <GitContributionUser /> : <GitContribution />}
        </div>
        <div className="row h50">
          <NoticeBoard />
        </div>
      </div>
      <div className="col w30">
        <Board isLoggedIn={true} />
      </div>
    </div>
  )
}

export default App
