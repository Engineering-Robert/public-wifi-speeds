import React, { Component } from "react"
import PropTypes from "prop-types"
import Stats from "./Stats"

function StatisticsModal(props) {
    return (
        <div
            className={
                "modal modal--stats" + (props.showStats ? " is-active" : "")
            }
        >
            <div className="modal-background" onClick={props.hideModal} />
            <div className="modal-content">
                <Stats entries={props.entries} />
            </div>
            <button
                className="modal-close is-large"
                aria-label="close"
                onClick={props.hideModal}
            />
        </div>
    )
}

StatisticsModal.propTypes = {}
StatisticsModal.defaultProps = {}

export default StatisticsModal