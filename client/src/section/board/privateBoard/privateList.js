import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'

import './privateList.css'
import Toggle from '../../../components/toggle/toggle'
import DreamButton from './dreamButton'

import { PRIVATE, CONTENT, CONTENT_LINK, hoToken } from '../hardWord'
import { WAITING_USERS, WAITING_USERS_LINK } from '../hardWord'

import projectInitial from '../projectInitial'
import privateDummy from '../../../dummy/board/privateDummy'
import { codeCubeApi } from '../axiosRequests'

const havePostAsHost = (obj) => {
  return obj.host.postId > 0
}

const PrivateList = ({ setHasHost, hasHost, isLoggedIn, setDashBoardInfo }) => {
  const [myDashBoard, setMyDashBoard] = useState(projectInitial)
  const navigation = useNavigate()

  useEffect(() => {
    console.log('reload')
    if (!isLoggedIn) {
      navigation('/')
    }
    // TODO: API
    axios.get('http://localhost:4000/myProjects').then(({ data }) => console.log(data))
    setMyDashBoard(privateDummy)
  }, [isLoggedIn])

  useEffect(() => {
    setHasHost(havePostAsHost(myDashBoard))
    setDashBoardInfo(myDashBoard)
  }, [myDashBoard])

  return (
    <>
      <DreamButton
        hasHost={hasHost}
        postState={myDashBoard.host.start + myDashBoard.host.done}
      />
      {hasHost ? (
        <Toggle
          leftName={CONTENT}
          rightName={WAITING_USERS}
          leftLink={CONTENT_LINK}
          rightLink={WAITING_USERS_LINK}
          privateClass={PRIVATE}
        ></Toggle>
      ) : null}
      <div id="private-wrapper">
        <Outlet />
      </div>
    </>
  )
}

export default PrivateList
