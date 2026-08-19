import React, { useState, useEffect } from 'react'
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
import { strings } from '@/lang/update-client-type'
import * as helper from '@/utils/helper'
import * as ClientTypeService from '@/services/ClientTypeService'
import Error from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import NoMatch from './NoMatch'
import { schema, FormFields } from '@/models/ClientTypeForm'

import '@/assets/css/create-user.css' // Reuse css

const UpdateClientType = () => {
    const navigate = useNavigate()
    const [formError, setFormError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = useState(false)
    const [noMatch, setNoMatch] = useState(false)
    const [clientType, setClientType] = useState<bookcarsTypes.ClientType>()

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

    const onLoad = async () => {
        setLoading(true)
        const params = new URLSearchParams(window.location.search)
        if (params.has('id')) {
            const id = params.get('id')
            if (id && id !== '') {
                try {
                    const _clientType = await ClientTypeService.getClientType(id)
                    if (_clientType) {
                        setClientType(_clientType)
                        setValue('name', _clientType.name)
                        setValue('displayName', _clientType.displayName)
                        setValue('description', _clientType.description || '')
                        if (_clientType.privileges) {
                            setValue('discount', _clientType.privileges.rentDiscount.toString())
                        }
                        setValue('active', _clientType.active)
                        setVisible(true)
                    } else {
                        setNoMatch(true)
                    }
                } catch (err) {
                    helper.error(err)
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
                setNoMatch(true)
            }
        } else {
            setLoading(false)
            setNoMatch(true)
        }
    }

    useEffect(() => {
        onLoad()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = async (data: FormFields) => {
        try {
            if (!clientType) {
                return
            }

            const payload: bookcarsTypes.ClientType = {
                _id: clientType._id,
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                privileges: { rentDiscount: Number(data.discount) },
                active: data.active,
            }

            const status = await ClientTypeService.update(payload)

            if (status === 200) {
                helper.info(commonStrings.UPDATED)
            } else {
                setFormError(true)
            }
        } catch (err) {
            helper.error(err)
        }
    }

    return (
        <Layout strict>
            {visible && clientType && (
                <div className="create-user">
                    <Paper className="user-form user-form-wrapper" elevation={10}>
                        <h1 className="user-form-title">{strings.UPDATE_CLIENT_TYPE_HEADING}</h1>
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
                                    {commonStrings.SAVE}
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
            )}
            {(loading || isSubmitting) && <Backdrop text={commonStrings.PLEASE_WAIT} disableMargin />}
            {noMatch && <NoMatch hideHeader />}
        </Layout>
    )
}

export default UpdateClientType
