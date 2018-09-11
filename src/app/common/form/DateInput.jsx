import React from 'react'
import { Form, Label } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const DateInput = ({input: {value, onChange, onBlur, ...restInput}, width, placeholder,
                       meta: {touched, error}, ...rest}) => {
    // ONBLUR: 这个与 manage user setting中的basic 中的生日有关，见第16章。
    //moment：要把input value转化为moment的格式
    // selected： 因为是个选择日历的形式
    // on changed： 我们希望date 被redux track， 所以我们用onchanged来update date的变化

    if (value) {
        value = moment(value, 'X')
    }

    return (

        <Form.Field error={touched && !!error} width={width}>
            <DatePicker
                {...rest}
                placeholderText={placeholder}
                selected={value ? moment(value) : null}
                onChange={onChange}
                {...restInput}
            />
            {touched && error && <Label basic color='red'>{error}</Label>}
        </Form.Field>
    )
}

export default DateInput