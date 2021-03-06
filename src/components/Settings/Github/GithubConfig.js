import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import queryString from 'query-string'
import GitHub from 'github-api'
import tinycolor from 'tinycolor2'

import GistListing from './GistListing'
import GistOps from './GistOps'

import {
  ghAuthStatusChange,
  ghAuthorise,
  ghUpdateBackupGistId,
  ghUserProfile
} from '../../../actions/actionCreators'

import { ghProfile } from '../../../api/ghProfile';

class GithubConfig extends PureComponent {

  constructor() {
    super()

    this.backup = this.backup.bind(this)
  }

  componentDidMount() {
     let query = queryString.parse(window.location.search)
     if ('code' in query) {
        console.log('code in query string')
        this.props.dispatch(ghAuthStatusChange('pending'))
        console.log("1. authorizing github access")
        this.props.dispatch(ghAuthorise(query.code))
          .then(() => {
            this.getGitHubProfile()
          })
     }  
  }

  async getGitHubProfile() {
    ghProfile().then(req => {
      return req.data
    }).then(profile => {
      console.log("2. asking for the user's profile")
      this.props.dispatch(ghUserProfile(profile))
    })
  }

  getButtonState() {
    if (this.props.github.ghAuthStatus === 'pending') {
      return <p className="waves-effect waves-light btn-large blue darken-3 disabled">Pending... Please wait.</p>
    } else if (!this.props.github.ghAuthStatus) {
      return <a className="waves-effect waves-light btn-large blue" href="https://github.com/login/oauth/authorize?scope=gist&client_id=20c031bc4aae68587cc4">Log in with Github</a>
    }
  }

  backup() {
    let ghClient = new GitHub({
        token: this.props.github.ghToken
    })

    var gist = ghClient.getGist()

    if (!this.props.github.ghBackupGistId) {
      gist.create({
        public: false,
        description: 'reactStartPage3 Backup',
        files: {
            "sites.json": {
              content: JSON.stringify(this.props.sites)
            }
          }
        })
      .then(data => {
        return gist.read()
      })
      .then(gist => {
        console.log(gist.data)
        this.props.dispatch(ghUpdateBackupGistId(gist.data.id))
        alert("Backup gist created!")
      })
    } else {
      console.log('Backup gist id not found in storage')
      let gist = ghClient.getGist(this.props.github.ghBackupGistId)
      gist.read()
      .then(data => {
        console.info('Reading gist from GH')
        gist.update({
          files: {
            'sites.json': {
              content: JSON.stringify(this.props.sites)
            }
          }
        })
        .then (data => {
          return gist.read()
        })
        .then (gist => {
          console.log('gist update')
          console.log(gist.data)
          alert("GitHub gist updated!")
        })
      })
    }
  }

  getComputedColor(withMargin) {
    var darkened = tinycolor(this.props.color)
    if (withMargin) {
      return {
        backgroundColor: darkened.darken(10),
        marginBottom: 0
      }
    }
    return {
      backgroundColor: darkened.darken(10)
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col s12 center">
            <div className="card"
                  style={ this.getComputedColor() }>
              <div className={ 'card-content ' + this.props.textColor }>
                <span className="card-title">Github</span>
                <p>Connect to GitHub to save/load your sites using Gists.</p>
                <br/>
                <div className="GithubConfig" id="GitHub">
                  { this.getButtonState() }

                  { this.props.github.ghToken ? <GistOps color={ this.props.color } backup={ this.backup } /> : null }

                  { this.props.github.ghToken ? <GistListing color={ this.props.color } /> : null }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          
    );
  }
}

const mapStateToProps = (state) => {
    return {
        github: state.github,
        sites: state.sites,
        color: state.color,
        textColor: state.textColor
    }
}

export default connect(mapStateToProps)(GithubConfig);
