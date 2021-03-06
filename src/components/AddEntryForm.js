// This line is required to tell the linter that the google variable will be available globally at runtime
/*global google*/

import React, { Component } from "react"
import moment from "moment"
import PropTypes from "prop-types"
import * as firebase from "firebase"
import PlacesAutocomplete from "react-places-autocomplete"
import { bindActionCreators } from "redux"
import styled from "styled-components"
import { connect } from "react-redux"
import { addEntry } from "../actions"

const mapStateToProps = function(state) {
    return {
        entries: state.entries,
    }
}

const mapDispatchToProps = function(dispatch) {
    return bindActionCreators(
        {
            addEntry: addEntry,
        },
        dispatch,
    )
}

const NumericalGroup = styled.div`
    display: flex;
`
const NumericalField = styled.div`
    flex: 1;
`

class AddEntryForm extends Component {
    constructor(props) {
        super(props)
        this.INITIAL_STATE = {
            location: "",
            download: "",
            upload: "",
            ping: "",
            note: "",
            errors: null,
            locationSelected: false,
        }
        this.state = this.INITIAL_STATE
    }

    componentDidMount = () => {
        // Prevent default form validation bubbles from appearing
        this.entryForm.addEventListener(
            "invalid",
            function(event) {
                event.preventDefault()
            },
            true,
        )
    }

    getCurrentDate = () => {
        // "02/01/2018"
        return moment(new Date()).format("DD/MM/YYYY")
    }

    checkValidation = () => {
        const invalidFields = this.entryForm.querySelectorAll(":invalid")
        let errorMessages = {}

        // Loop through all invalid fields and add them to the errorMessages object
        invalidFields.forEach((field, key) => {
            errorMessages[field.dataset.name] =
                invalidFields[key].validationMessage
        })

        if (invalidFields.length > 0) {
            invalidFields[0].focus()
            this.setState({
                errors: errorMessages,
            })
        }
    }
    onSubmit = e => {
        e.preventDefault()
        const errors = this.props.validateInputs(
            this.state.location,
            this.state.locationSelected,
            this.state.download,
            this.state.upload,
            this.state.ping,
            this.state.note,
        )
        if (Object.keys(errors).length === 0) {
            const databaseRef = firebase
                .database()
                .ref("/entries/" + this.props.city)
                .push(sanitizedInputs)

            const sanitizedInputs = this.props.sanitizeInputs({
                location: this.state.location,
                date: this.getCurrentDate(),
                id: databaseRef.getKey(),
                timestamp: Date.now(),
                download: this.state.download,
                upload: this.state.upload,
                ping: this.state.ping,
                note: this.state.note,
                uid: this.props.user.uid,
            })

            this.setState(this.INITIAL_STATE)
            // Set Redux Store
            this.props.addEntry(sanitizedInputs)

            this.entryForm.reset()
            // Trigger a change event on all form inputs (fixes a bug where the input doesn't detect a change in the input when submitting a second consecutive entry.
            this.entryForm
                .querySelectorAll(".input, .textarea")
                .forEach(value => {
                    value.dispatchEvent(new Event("change", { bubbles: true }))
                })
            this.props.hideForm()
        } else {
            this.setState({
                errors: errors,
            })
        }
    }

    handleLocationSelect = address => {
        this.setState({
            location: address,
            locationSelected: true,
        })
    }

    render() {
        return (
            <form
                ref={el => (this.entryForm = el)}
                className="add-entry-form"
                onSubmit={this.onSubmit.bind(this)}
            >
                <div className={"field"}>
                    <label className={"label"}>Location</label>
                    <div className={"control"}>
                        <PlacesAutocomplete
                            inputProps={{
                                value: this.state.location,
                                onChange: location =>
                                    this.setState({
                                        location,
                                        locationSelected: true,
                                    }),
                                placeholder: "CRAVE Coffee House & Bakery",
                                maxLength: "150",
                                required: true,
                                "data-name": "location",
                            }}
                            classNames={{
                                root: "add-entry-form__autocomplete",
                                autocompleteContainer:
                                    "add-entry-form__autocomplete-results",
                                input:
                                    "input" +
                                    (this.state.errors &&
                                    this.state.errors.location
                                        ? " is-danger"
                                        : ""),
                            }}
                            googleLogo={false}
                            options={{
                                location: new google.maps.LatLng(
                                    this.props.cityCoordinates.latitude,
                                    this.props.cityCoordinates.longitude,
                                ),
                                radius: 20000,
                                type: ["address"],
                            }}
                            onSelect={this.handleLocationSelect}
                        />
                    </div>
                    {this.state.errors && this.state.errors.location ? (
                        <p className="help is-danger">
                            {this.state.errors.location}
                        </p>
                    ) : null}
                </div>
                <NumericalGroup className="field is-grouped is-grouped-centered is-grouped-multiline">
                    <NumericalField className="control">
                        <label className="label">Download (Mbps)</label>
                        <input
                            className={
                                "input" +
                                (this.state.errors && this.state.errors.download
                                    ? " is-danger"
                                    : "")
                            }
                            data-name="download"
                            type="number"
                            min="0"
                            max="1000"
                            step="0.01"
                            placeholder="12"
                            onChange={e =>
                                this.setState({ download: e.target.value })
                            }
                            required
                        />
                        {this.state.errors && this.state.errors.download ? (
                            <p className="help is-danger">
                                {this.state.errors.download}
                            </p>
                        ) : null}
                    </NumericalField>
                    <NumericalField className="control form__number-input">
                        <label className="label">Upload (Mbps)</label>
                        <input
                            className={
                                "input" +
                                (this.state.errors && this.state.errors.upload
                                    ? " is-danger"
                                    : "")
                            }
                            data-name="upload"
                            type="number"
                            min="0"
                            max="1000"
                            step="0.01"
                            placeholder="12"
                            onChange={e =>
                                this.setState({ upload: e.target.value })
                            }
                            required
                        />
                        {this.state.errors && this.state.errors.upload ? (
                            <p className="help is-danger">
                                {this.state.errors.upload}
                            </p>
                        ) : null}
                    </NumericalField>
                    <NumericalField className="control form__number-input">
                        <label className="label">Ping (ms)</label>
                        <input
                            className={
                                "input" +
                                (this.state.errors && this.state.errors.ping
                                    ? " is-danger"
                                    : "")
                            }
                            data-name="ping"
                            type="number"
                            min="0"
                            max="500"
                            step="0.01"
                            placeholder="12"
                            onChange={e =>
                                this.setState({ ping: e.target.value })
                            }
                            required
                        />
                        {this.state.errors && this.state.errors.ping ? (
                            <p className="help is-danger">
                                {this.state.errors.ping}
                            </p>
                        ) : null}
                    </NumericalField>
                </NumericalGroup>
                <div className="field">
                    <label className="label">Note</label>
                    <div className="control">
                        <textarea
                            className={
                                "textarea" +
                                (this.state.errors && this.state.errors.note
                                    ? " is-danger"
                                    : "")
                            }
                            data-name="note"
                            type="textarea"
                            placeholder="The food was great but the wifi was slow :'("
                            onChange={e =>
                                this.setState({ note: e.target.value })
                            }
                            maxLength="1000"
                        />
                        {this.state.errors && this.state.errors.note ? (
                            <p className="help is-danger">
                                {this.state.errors.note}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="field-body">
                    <div className="field is-grouped is-grouped-centered">
                        <div className="control">
                            <button
                                onClick={this.checkValidation}
                                type="submit"
                                className="button is-success"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddEntryForm)
