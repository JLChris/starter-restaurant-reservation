import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { readReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function EditReservation({ loadDashboard }) {
    const history = useHistory();
    const params = useParams();

    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});


    const reservationId = Number(params.reservation_id);

    useEffect(() => {
        const abortController = new AbortController();
        setError(null);
        setFormData({});
        readReservation(reservationId, abortController.signal)
            .then(setFormData)
            .catch(setError);
        return () => abortController.abort();
    }, [reservationId]);

    const changeHandler = ({ target }) => {
        setFormData({
            ...formData,
            [target.name]: target.value,
        });
    };

    const cancelHandler = () => {
        history.goBack();
    }

    const submitHandler = (event) => {
        event.preventDefault();
        formData.people = Number(formData.people);
        updateReservation(reservationId, formData)
            .then(() => {
                loadDashboard();
                history.push(`/dashboard?date=${formData.reservation_date}`);
            })
            .catch(setError);
    }


    return (
        <>
            <h1>Edit Reservation</h1>
            <ErrorAlert error={error} />
            <form className="row g-3" onSubmit={submitHandler}>
                <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        className="form-control"
                        id="first_name"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        id="last_name"
                        placeholder="Smith"
                        value={formData.last_name}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="col-12 mb-3">
                    <label htmlFor="mobile_number" className="form-label">Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile_number"
                        className="form-control w-25"
                        id="mobile_number"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        placeholder="xxx-xxx-xxxx"
                        value={formData.mobile_number}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="col-md-2 mb-3">
                    <label htmlFor="reservation_date" className="form-label">Date of Reservation</label>
                    <input
                        type="date"
                        name="reservation_date"
                        className="form-control"
                        id="reservation_date"
                        pattern="\d{4}-\d{2}-\d{2}"
                        placeholder="YYYY-MM-DD"
                        value={formData.reservation_date}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <label htmlFor="reservation_time" className="form-label">Time of Reservation</label>
                    <input
                        type="time"
                        name="reservation_time"
                        className="form-control"
                        id="reservation_time"
                        pattern="[0-9]{2}:[0-9]{2}"
                        placeholder="HH:MM"
                        value={formData.reservation_time}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="col-2 mb-3">
                    <label htmlFor="people" className="form-label">Party Size</label>
                    <input
                        type="number"
                        name="people"
                        className="form-control w-25"
                        id="people"
                        min="1"
                        value={formData.people}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary mr-3">Submit</button>
                    <button type="button" className="btn btn-danger" onClick={cancelHandler}>Cancel</button>
                </div>
            </form>
        </>
    )
}

export default EditReservation;