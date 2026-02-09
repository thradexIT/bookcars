import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper,
    FormControlLabel,
    Switch,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/create-client-type'
import * as helper from '@/utils/helper'
import * as ClientTypeService from '@/services/ClientTypeService'
import Error from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import { schema, FormFields } from '@/models/ClientTypeForm'

import '@/assets/css/create-user.css' // Reuse css

const CreateClientType = () => {
    const navigate = useNavigate()
    const [formError, setFormError] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            displayName: '',
            description: '',
            discount: '',
            active: true,
        },
    })

    const active = watch('active')

    const onSubmit = async (data: FormFields) => {
        try {
            const payload: bookcarsTypes.ClientType = {
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                privileges: { rentDiscount: Number(data.discount) },
                active: data.active,
            }

            const status = await ClientTypeService.create(payload)

            if (status === 200) {
                navigate('/client-types')
            } else {
                setFormError(true)
            }
        } catch (err) {
            helper.error(err)
        }
    }

    return (
        <Layout strict>
            <div className="create-user">
                <Paper className="user-form user-form-wrapper" elevation={10}>
                    <h1 className="user-form-title">{strings.CREATE_CLIENT_TYPE_HEADING}</h1>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <FormControl fullWidth margin="dense">
                            <InputLabel className="required">{strings.NAME}</InputLabel>
                            <Input
                                {...register('name')}
                                type="text"
                                autoComplete="off"
                                required
                                error={!!errors.name}
                            />
                            <FormHelperText error={!!errors.name}>
                                {errors.name?.message || ''}
                            </FormHelperText>
                        </FormControl>

                        <FormControl fullWidth margin="dense">
                            <InputLabel className="required">{strings.DISPLAY_NAME}</InputLabel>
                            <Input
                                {...register('displayName')}
                                type="text"
                                autoComplete="off"
                                required
                                error={!!errors.displayName}
                            />
                            <FormHelperText error={!!errors.displayName}>
                                {errors.displayName?.message || ''}
                            </FormHelperText>
                        </FormControl>

                        <FormControl fullWidth margin="dense">
                            <InputLabel>{strings.DESCRIPTION}</InputLabel>
                            <Input
                                {...register('description')}
                                type="text"
                                autoComplete="off"
                                multiline
                                minRows={1}
                                maxRows={4}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="dense">
                            <InputLabel>{strings.DISCOUNT}</InputLabel>
                            <Input
                                {...register('discount')}
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                autoComplete="off"
                                error={!!errors.discount}
                            />
                            <FormHelperText error={!!errors.discount}>
                                {errors.discount?.message || ''}
                            </FormHelperText>
                        </FormControl>

                        <FormControl fullWidth margin="dense">
                            <FormControlLabel
                                control={(
                                    <Switch
                                        checked={active}
                                        onChange={(e) => {
                                            setValue('active', e.target.checked)
                                        }}
                                        color="primary"
                                    />
                                )}
                                label={strings.ACTIVE}
                            />
                        </FormControl>

                        <div className="buttons">
                            <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small" disabled={isSubmitting}>
                                {commonStrings.CREATE}
                            </Button>
                            <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" onClick={() => navigate('/client-types')}>
                                {commonStrings.CANCEL}
                            </Button>
                        </div>

                        <div className="form-error">
                            {formError && <Error message={commonStrings.GENERIC_ERROR} />}
                        </div>
                    </form>
                </Paper>
            </div>
            {(isSubmitting) && <Backdrop text={commonStrings.PLEASE_WAIT} disableMargin />}
        </Layout>
    )
}

export default CreateClientType
