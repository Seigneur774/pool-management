import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import AppBar from 'components/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircle from '@material-ui/icons/AccountCircle'
import AccountBalance from '@material-ui/icons/AccountBalance'
import Assignment from '@material-ui/icons/Assignment'
import SwapHoriz from '@material-ui/icons/SwapHoriz'
import { appConfig } from 'configs/config-main'
import { styles } from './styles.scss'
import { getProvider } from '../../../../core/services/providerService'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null,
      addess: ''
    }
  }

  getMenu() {
    const { anchorEl, address } = this.state
    this.checkAccount()
    return (
      <div>
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className="dropdown"
          aria-owns={anchorEl ? 'simple-menu' : null}
          onClick={this.handleClick}
        >
          <h4> {address} </h4><AccountCircle />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.close}
        >
          <MenuItem data-link="account" onClick={this.goTo}>Menu Option 1</MenuItem>
          <MenuItem data-link="settings" onClick={this.goTo}>Menu Option 2</MenuItem>
        </Menu>
      </div>
    )
  }

  checkAccount = () => {
    getProvider().then((provider) => {
      if (provider.result === 'success') {
        this.setState({ address: provider.web3Provider.eth.defaultAccount })
      }
    })
  }

  goTo = (evt) => {
    const { history } = this.props
    const { link } = evt.currentTarget.dataset

    history.push(link)
    this.close()
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  close = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const menu = this.getMenu()

    return (
      <div className={styles}>
        <AppBar>
          <Toolbar>
            <Link className="menu-icon" href="/list" to="/list">
              <IconButton className="menu-icon" edge="start" color="inherit" aria-label="menu">
                <Typography variant="title" color="inherit">
                  {appConfig.name}
                </Typography>
              </IconButton>
            </Link>
            <Link className="menu-icon" href="/list" to="/list">
              <IconButton color="inherit" aria-label="menu">
                <SwapHoriz />
                <Typography variant="title" color="inherit">
                  Swap
                </Typography>
              </IconButton>
            </Link>
            <Link className="menu-icon" href="/my-pools" to="/my-pools">
              <IconButton color="inherit" aria-label="menu">
                <AccountBalance />
                <Typography variant="title" color="inherit">
                  Manage
                </Typography>
              </IconButton>
            </Link>
            <Link className="menu-icon" href="/logs-list" to="/logs-list">
              <IconButton color="inherit" aria-label="menu">
                <Assignment />
                <Typography variant="title" color="inherit">
                  View Logs
                </Typography>
              </IconButton>
            </Link>
            {menu}
          </Toolbar>
        </AppBar>
      </div >
    )
  }
}

Header.propTypes = {
  history: PropTypes.shape({}).isRequired
}

export default withRouter(Header)
