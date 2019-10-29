import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import tinycolor from 'tinycolor2'

import Nav from '../Nav'
import TodayBar from '../TodayBar'
import GithubConfig from './Github/GithubConfig'
import ColorPicker from './Theme/ColorPicker'

import { setColor, setTextColor } from '../../actions/actionCreators'
import ExportData from './Export/ExportData';

class SettingsPage extends PureComponent {

    constructor() {
        super()

        this.onColorChange = this.onColorChange.bind(this)
    }


    onColorChange(values) {
        this.props.dispatch(setColor(values.hex))
        let color = tinycolor(values.hex)

        if (color.isDark()) {
            this.props.dispatch(setTextColor('white-text'))
        } else {
            this.props.dispatch(setTextColor('grey-text text-darken-4'))
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
            backgroundColor: darkened.darken(10),
        }
    }

    render() {
        return (
        <div className="App">
            <Nav ghAuthStatus={ this.props.github.ghAuthStatus } />
            <TodayBar />
            <div className="container">
                <div className="row">
                    <div className="col s12 m4 center">
                        <ColorPicker onColorChange={ this.onColorChange }/>
                    </div>
                    <div className="col s12 m8 center">
                        <ExportData />
                    </div>
                </div>

            </div>
            <GithubConfig />
        </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        color: state.color,
        textColor: state.textColor,
        github: state.github
    }
}

export default connect(mapStateToProps)(SettingsPage);