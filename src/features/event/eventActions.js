import { toastr } from 'react-redux-toastr'
import {DELETE_EVENT, FETCH_EVENTS} from './eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError } from '../async/asyncActions';
import { fetchSampleData } from '../../app/data/mockAPI'
import { createNewEvent } from '../../app/common/util/helpers';
import moment from 'moment';

//////////////////////////////////////create events///////////////////////////////////////////

// 加 TOASTR之前
// export const createEvent = (event) => {
//     return {
//         type: CREATE_EVENT,
//         payload: {
//             event
//         }
//     }
// }

// 加 TOASTR之后
// export const createEvent = event => {
//     return async dispatch => {
//         try {
//             dispatch({
//                 type: CREATE_EVENT,
//                 payload: {
//                     event
//                 }
//             });
//             toastr.success('Success', 'Event has been created')
//         } catch (error) {
//             toastr.error('Oops', 'Something went wrong')
//         }
//     };
// };

// 加了fire store之后。
//我们的input event由 eventform产生并传入，然后我们通过fire store的function把各个参数取出，然后把这些参数作为input
//给 helper function， 让它去create一个new活动，然后把新活动存入fire store就可以了。

export const createEvent = event => {
    return async (dispatch, getState, { getFirestore }) => {
        const firestore = getFirestore();
        const user = firestore.auth().currentUser;
        const photoURL = getState().firebase.profile.photoURL;
        let newEvent = createNewEvent(user, photoURL, event);
        try {

            // 使用ADD, 这样 fire store会自动为我们create eventID
            // 使用SET, firestore在create一个collection，并且把你规定的ID设为DOC ID .
            let createdEvent = await firestore.add(`events`, newEvent);
            await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`, {
                //这里我们之所以把这四个取出来，因为我们要加filter，可以得到pastevent， futureevent等等
                eventId: createdEvent.id,
                userUid: user.uid,
                eventDate: event.date,
                host: true
            });
            toastr.success('Success', 'Event has been created');
        } catch (error) {
            toastr.error('Oops', 'Something went wrong');
        }
    };
};




/////////////////////////////////////update events///////////////////////////////////////////

// 加 TOASTR之前
// export const updateEvent = (event) => {
//     return {
//         type: UPDATE_EVENT,
//         payload: {
//             event
//         }
//     }
// }
// 加 TOASTR之后
// export const updateEvent = event => {
//     return async dispatch => {
//         try {
//             dispatch({
//                 type: UPDATE_EVENT,
//                 payload: {
//                     event
//                 }
//             });
//             toastr.success('Success', 'Event has been updated')
//         } catch (error) {
//             toastr.error('Oops', 'Something went wrong')
//         }
//     };
// };

//after firestore

export const updateEvent = event => {
    return async (dispatch, getState, { getFirestore }) => {
        const firestore = getFirestore();

        if (event.date !== getState().firestore.ordered.events[0].date) {
            event.date = moment(event.date).toDate();
        }
        try {
            await firestore.update(`events/${event.id}`, event);
            toastr.success('Success', 'Event has been updated');
        } catch (error) {
            console.log(error);
            toastr.error('Oops', 'Something went wrong');
        }
    };
};

export const cancelToggle = (cancelled, eventId) => async (
    dispatch,
    getState,
    { getFirestore }
) => {
    const firestore = getFirestore();
    const message = cancelled
        ? 'Are you sure you want to cancel the event?'
        : 'This reactivate the event - are you sure?';
    try {
        toastr.confirm(message, {
            onOk: () =>
                firestore.update(`events/${eventId}`, {
                    cancelled: cancelled
                })
        });
    } catch (error) {
        console.log(error);
    }
};



/////////////////////////////////////delete events///////////////////////////////////////////

export const deleteEvent = (eventId) => {
    return {
        type: DELETE_EVENT,
        payload: {
            eventId
        }
    }
}


///////////////////////////////////////FOR ASYNC//////////////////////////////////////////
export const fetchEvents = (events) => {
    return {
        type: FETCH_EVENTS,
        payload: events
    }
}

//dispatch  method
export const loadEvents = () => {
    return async dispatch => {
        try {
            dispatch(asyncActionStart())
            let events = await fetchSampleData();
            dispatch(fetchEvents(events))
            dispatch(asyncActionFinish());
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
        }
    }
}