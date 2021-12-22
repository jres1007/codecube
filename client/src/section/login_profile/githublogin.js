import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
require('dotenv').config()

// const client_id = process.env.GITHUB_CLIENT_ID
// const client_secret = process.env.GITHUB_CLIENT_SECRET

const GitHubLogin = (props) => {
  const redirectUrl = () => {
    window.location.replace(
      'https://github.com/login/oauth/authorize?client_id=1386659d2aaad143ab19'
    )
  }

  return <input type="button" value="Githublogin" onClick={redirectUrl} />
}

export default GitHubLogin