import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  InputLabel,
  Input
} from '@mui/material'
import {
  Person as DriverIcon
} from '@mui/icons-material'
import { DateTimeValidationError } from '@mui/x-date-pickers'
import { Control, FieldErrors, useForm, UseFormClearErrors, UseFormRegister, UseFormSetValue, UseFormTrigger, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings as blStrings } from '@/lang/booking-list'
import { strings as bfStrings } from '@/lang/booking-filter'
import { strings as csStrings } from '@/lang/cars'
import { strings } from '@/lang/booking'
import * as helper from '@/utils/helper'
import Layout from '@/components/Layout'
import * as UserService from '@/services/UserService'
import * as BookingService from '@/services/BookingService'
import * as CarService from '@/services/CarService'
import Backdrop from '@/components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Error from './Error'
import CarList from '@/components/CarList'
import SupplierSelectList from '@/components/SupplierSelectList'
import UserSelectList from '@/components/UserSelectList'
import LocationSelectList from '@/components/LocationSelectList'
import CarSelectList from '@/components/CarSelectList'
import StatusList from '@/components/StatusList'
import DateTimePicker from '@/components/DateTimePicker'
import DatePicker from '@/components/DatePicker'
import { Option } from '@/models/common'
import { schema, FormFields } from '@/models/BookingForm'
import { io } from 'socket.io-client'

import '@/assets/css/booking.css'

// ─── Additional Driver sub-form ───────────────────────────────────────────────
interface AdditionalDriverFormProps {
  control: Control<FormFields>
  register: UseFormRegister<FormFields>
  errors: FieldErrors<FormFields>
  clearErrors: UseFormClearErrors<FormFields>
  trigger: UseFormTrigger<FormFields>
  setValue: UseFormSetValue<FormFields>
  language: string
}

const AdditionalDriverForm = ({ control, register, errors, clearErrors, trigger, setValue, language }: AdditionalDriverFormProps) => {
  const additionalDriverBirthDate = useWatch({ control, name: 'additionalDriverBirthDate' })
  const additionalEmail = useWatch({ control, name: 'additionalDriverEmail' })
  const additionalDriverPhone = useWatch({ control, name: 'additionalDriverPhone' })

  return (
    <>
      <div className="info">
        <DriverIcon />
        <span>{csStrings.ADDITIONAL_DRIVER}</span>
      </div>
      <FormControl fullWidth margin="dense">
        <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
        <Input
          {...register('additionalDriverFullName')}
          type="text"
          required
          autoComplete="off"
        />
        {errors.additionalDriverFullName && <FormHelperText error>{commonStrings.REQUIRED}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="dense">
        <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
        <Input
          value={additionalEmail || ''}
          onChange={(e) => {
            if (errors.additionalDriverEmail) {
              clearErrors('additionalDriverEmail')
            }
            setValue('additionalDriverEmail', e.target.value)
          }}
          onBlur={() => trigger('additionalDriverEmail')}
          type="text"
          error={!!errors.additionalDriverEmail}
          required
          autoComplete="off"
        />
        {errors.additionalDriverEmail && <FormHelperText error>{errors.additionalDriverEmail.message}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="dense">
        <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
        <Input
          value={additionalDriverPhone || ''}
          type="text"
          error={!!errors.additionalDriverPhone}
          required
          autoComplete="off"
          onChange={(e) => {
            if (errors.additionalDriverPhone) {
              clearErrors('additionalDriverPhone')
            }
            setValue('additionalDriverPhone', e.target.value)
          }}
          onBlur={() => trigger('additionalDriverPhone')}
        />
        {errors.additionalDriverPhone && <FormHelperText error>{errors.additionalDriverPhone.message}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth margin="dense">
        <DatePicker
          label={commonStrings.BIRTH_DATE}
          value={additionalDriverBirthDate}
          required
          onChange={(birthDate) => {
            if (birthDate) {
              if (errors.additionalDriverBirthDate) {
                clearErrors('additionalDriverBirthDate')
              }
              setValue('additionalDriverBirthDate', birthDate)
              trigger('additionalDriverBirthDate')
            }
          }}
          language={language}
        />
        {errors.additionalDriverBirthDate && (
          <FormHelperText error>
            {helper.getBirthDateError(env.MINIMUM_AGE)}
          </FormHelperText>
        )}
      </FormControl>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const UpdateBooking = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<bookcarsTypes.User>()
  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [formError, setFormError] = useState(false)
  const [booking, setBooking] = useState<bookcarsTypes.Booking>()
  const [visible, setVisible] = useState(false)
  const [carObj, setCarObj] = useState<bookcarsTypes.Car>()
  const [isSupplier, setIsSupplier] = useState(false)
  const [minDate, setMinDate] = useState<Date>()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [fromError, setFromError] = useState(false)
  const [toError, setToError] = useState(false)
  const [price, setPrice] = useState<number>()

  // ── Auto-refresh via BroadcastChannel + WebSocket ──────────────────────────
  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('bookcars-checkout')
      bc.onmessage = async (e) => {
        const params = new URLSearchParams(window.location.search)
        const currentId = params.get('b')
        if (currentId && e.data?.type === 'checkout-completed' && e.data?.bookingId === currentId) {
          try {
            const refreshed = await BookingService.getBooking(currentId)
            if (refreshed) {
              setBooking(refreshed)
            }
          } catch { /* silent */ }
        }
      }
    } catch { /* BroadcastChannel not supported */ }

    const socket = io(env.API_HOST)
    socket.on('booking-updated', async (data: any) => {
      const params = new URLSearchParams(window.location.search)
      const currentId = params.get('b')
      if (currentId && data?.bookingId === currentId) {
        try {
          const refreshed = await BookingService.getBooking(currentId)
          if (refreshed) {
            setBooking(refreshed)
          }
        } catch { /* silent */ }
      }
    })

    return () => {
      bc?.close()
      socket?.disconnect()
    }
  }, [])

  const {
    register, control, handleSubmit, setValue,
    formState: { errors, isSubmitting },
    clearErrors, trigger,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      supplier: undefined, driver: undefined, pickupLocation: undefined,
      dropOffLocation: undefined, car: undefined, status: undefined,
      cancellation: false, amendments: false, theftProtection: false,
      collisionDamageWaiver: false, fullInsurance: false,
      additionalDriver: false, additionalDriverFullName: '',
      additionalDriverEmail: '', additionalDriverPhone: '',
    }
  })

  const supplier = useWatch({ control, name: 'supplier' })
  const pickupLocation = useWatch({ control, name: 'pickupLocation' })
  const dropOffLocation = useWatch({ control, name: 'dropOffLocation' })
  const driver = useWatch({ control, name: 'driver' })
  const from = useWatch({ control, name: 'from' })
  const to = useWatch({ control, name: 'to' })
  const status = useWatch({ control, name: 'status' })
  const cancellation = useWatch({ control, name: 'cancellation' })
  const amendments = useWatch({ control, name: 'amendments' })
  const theftProtection = useWatch({ control, name: 'theftProtection' })
  const collisionDamageWaiver = useWatch({ control, name: 'collisionDamageWaiver' })
  const fullInsurance = useWatch({ control, name: 'fullInsurance' })
  const additionalDriver = useWatch({ control, name: 'additionalDriver' })

  const toastErr = (err?: unknown, hideLoading?: boolean) => {
    helper.error(err)
    if (hideLoading) {
      setLoading(false)
    }
  }

  const handleDelete = () => setOpenDeleteDialog(true)
  const handleCancelDelete = () => setOpenDeleteDialog(false)

  const handleConfirmDelete = async () => {
    if (booking?._id) {
      try {
        setOpenDeleteDialog(false)
        const _status = await BookingService.deleteBookings([booking._id])
        if (_status === 200) {
          navigate('/')
        } else {
          toastErr(true)
        }
      } catch (err) {
        helper.error(err)
      }
    } else {
      helper.error()
    }
  }

  const onSubmit = async (data: FormFields) => {
    try {
      const additionalDriverSet = helper.carOptionAvailable(carObj, 'additionalDriver') && data.additionalDriver

      if (!booking) {
        helper.error()
        return
      }
      if (fromError || toError) {
        return
      }

      const _booking: bookcarsTypes.Booking = {
        _id: booking._id,
        supplier: data.supplier?._id!,
        car: data.car?._id!,
        driver: data.driver?._id,
        pickupLocation: data.pickupLocation?._id!,
        dropOffLocation: data.dropOffLocation?._id!,
        from: data.from!, to: data.to!,
        status: data.status as bookcarsTypes.BookingStatus,
        cancellation: data.cancellation, amendments: data.amendments,
        theftProtection: data.theftProtection, collisionDamageWaiver: data.collisionDamageWaiver,
        fullInsurance: data.fullInsurance, additionalDriver: additionalDriverSet,
        price, isDeposit: booking.isDeposit, isPayedInFull: booking.isPayedInFull,
      }

      let payload: bookcarsTypes.UpsertBookingPayload
      if (additionalDriverSet) {
        const _additionalDriver: bookcarsTypes.AdditionalDriver = {
          fullName: data.additionalDriverFullName!,
          email: data.additionalDriverEmail!,
          phone: data.additionalDriverPhone!,
          birthDate: data.additionalDriverBirthDate!,
        }
        payload = { booking: _booking, additionalDriver: _additionalDriver }
      } else {
        payload = { booking: _booking }
      }

      const _status = await BookingService.update(payload)
      if (_status === 200) {
        if (!additionalDriverSet) {
          setValue('additionalDriverFullName', '')
          setValue('additionalDriverEmail', '')
          setValue('additionalDriverPhone', '')
          setValue('additionalDriverBirthDate', undefined)
        }
        helper.info(commonStrings.UPDATED)
      } else {
        toastErr()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user) {
      setUser(_user)
      setLanguage(UserService.getLanguage())
      setLoading(true)

      const params = new URLSearchParams(window.location.search)
      if (params.has('b')) {
        const id = params.get('b')
        if (id && id !== '') {
          try {
            const _booking = await BookingService.getBooking(id)
            if (_booking) {
              if (!helper.admin(_user) && (_booking.supplier as bookcarsTypes.User)._id !== _user._id) {
                setLoading(false); setNoMatch(true); return
              }
              if (!_booking.driver) {
                setLoading(false); setNoMatch(true); return
              }

              setBooking(_booking)
              setPrice(_booking.price)
              setLoading(false)
              setVisible(true)
              setIsSupplier(_user.type === bookcarsTypes.RecordType.Supplier)

              const cmp = _booking.supplier as bookcarsTypes.User
              setValue('supplier', { _id: cmp._id as string, name: cmp.fullName, image: cmp.avatar })
              setValue('car', _booking.car as bookcarsTypes.Car)
              setCarObj(_booking.car as bookcarsTypes.Car)
              const drv = _booking.driver as bookcarsTypes.User
              setValue('driver', { _id: drv._id as string, name: drv.fullName, image: drv.avatar })
              const pul = _booking.pickupLocation as bookcarsTypes.Location
              setValue('pickupLocation', { _id: pul._id, name: pul.name || '' })
              const dol = _booking.dropOffLocation as bookcarsTypes.Location
              setValue('dropOffLocation', { _id: dol._id, name: dol.name || '' })
              setValue('from', new Date(_booking.from))
              const _minDate = new Date(_booking.from)
              _minDate.setDate(_minDate.getDate() + 1)
              setMinDate(_minDate)
              setValue('to', new Date(_booking.to))
              setValue('status', _booking.status)
              setValue('cancellation', _booking.cancellation || false)
              setValue('amendments', _booking.amendments || false)
              setValue('theftProtection', _booking.theftProtection || false)
              setValue('collisionDamageWaiver', _booking.collisionDamageWaiver || false)
              setValue('fullInsurance', _booking.fullInsurance || false)
              setValue('additionalDriver', (_booking.additionalDriver && !!_booking._additionalDriver) || false)
              if (_booking.additionalDriver && _booking._additionalDriver) {
                const _ad = _booking._additionalDriver as bookcarsTypes.AdditionalDriver
                setValue('additionalDriverFullName', _ad.fullName)
                setValue('additionalDriverEmail', _ad.email)
                setValue('additionalDriverPhone', _ad.phone)
                setValue('additionalDriverBirthDate', new Date(_ad.birthDate))
              }
            } else {
              setLoading(false); setNoMatch(true)
            }
          } catch {
            setLoading(false); setFormError(true); setVisible(false)
          }
        } else {
          setLoading(false); setNoMatch(true)
        }
      } else {
        setLoading(false); setNoMatch(true)
      }
    }
  }

  const days = bookcarsHelper.days(from, to)

  // ── Helper: build options object from current watched values ──
  const currentOptions = (): bookcarsTypes.CarOptions => ({
    cancellation,
    amendments,
    theftProtection,
    collisionDamageWaiver,
    fullInsurance,
    additionalDriver,
  })

  const recalcPrice = async (overrides: Partial<bookcarsTypes.CarOptions> = {}) => {
    if (!carObj || !from || !to) {
      return
    }
    const opts = { ...currentOptions(), ...overrides }
    const p = await bookcarsHelper.calculateTotalPrice(carObj, from, to, carObj.supplier.priceChangeRate || 0, opts)
    setPrice(p)
  }

  // ── Checkbox toggle factory ────────────────────────────────────
  const makeToggle = (field: keyof bookcarsTypes.CarOptions) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!booking || !carObj || !from || !to) {
      return
    }
    const _booking = bookcarsHelper.clone(booking) as bookcarsTypes.Booking
      ; (_booking as any)[field] = e.target.checked
    setBooking(_booking)
    setValue(field as any, e.target.checked)
    await recalcPrice({ [field]: e.target.checked })
  }

  return (
    <Layout onLoad={onLoad} strict>
      {visible && booking && (
        <form onSubmit={handleSubmit(onSubmit)} className="booking-container">
          <div className="booking-3col-grid">

            {/* ══ COL 1: IZQUIERDA (Configuración) ══════════════════ */}
            <div className="booking-col booking-col-1">
              <div className="section-title">Información Principal</div>

              {!isSupplier && (
                <FormControl fullWidth size="small">
                  <SupplierSelectList
                    label={blStrings.SUPPLIER}
                    required
                    variant="standard"
                    onChange={(values) => {
                      setValue('supplier', values.length > 0 ? values[0] as Option : undefined)
                      setValue('car', undefined)
                      setCarObj(undefined)
                    }}
                    value={supplier}
                  />
                </FormControl>
              )}

              <UserSelectList
                label={blStrings.DRIVER}
                required
                variant="standard"
                onChange={(values) => setValue('driver', values.length > 0 ? values[0] as Option : undefined)}
                value={driver}
              />

              <FormControl fullWidth size="small">
                <LocationSelectList
                  label={bfStrings.PICK_UP_LOCATION}
                  required variant="standard"
                  onChange={(values) => setValue('pickupLocation', values.length > 0 ? values[0] as Option : undefined)}
                  value={pickupLocation}
                />
              </FormControl>

              <FormControl fullWidth size="small">
                <LocationSelectList
                  label={bfStrings.DROP_OFF_LOCATION}
                  required variant="standard"
                  onChange={(values) => setValue('dropOffLocation', values.length > 0 ? values[0] as Option : undefined)}
                  value={dropOffLocation}
                />
              </FormControl>

              <CarSelectList
                label={blStrings.CAR}
                supplier={supplier?._id!}
                pickupLocation={pickupLocation?._id!}
                value={carObj}
                onChange={async (values) => {
                  try {
                    const newCar = values.length > 0 ? values[0] : undefined
                    if ((!carObj && newCar) || (carObj && newCar && carObj._id !== newCar._id)) {
                      const _car = await CarService.getCar(newCar._id)
                      if (_car && from && to) {
                        const _booking = bookcarsHelper.clone(booking)
                        _booking.car = _car
                        const p = await bookcarsHelper.calculateTotalPrice(_car, from, to, _car.supplier.priceChangeRate || 0, currentOptions())
                        setPrice(p)
                        setBooking(_booking)
                        setCarObj(newCar)
                        setValue('car', newCar)
                      } else {
                        helper.error()
                      }
                    } else if (!newCar) {
                      setPrice(0)
                      setCarObj(newCar)
                      setValue('car', newCar)
                    } else {
                      setCarObj(newCar)
                      setValue('car', newCar)
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}
                required
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <FormControl fullWidth size="small">
                  <DateTimePicker
                    label={commonStrings.FROM}
                    value={from} required
                    onChange={async (date) => {
                      if (date) {
                        const _booking = bookcarsHelper.clone(booking) as bookcarsTypes.Booking
                        _booking.from = date
                        const p = await bookcarsHelper.calculateTotalPrice(carObj!, date, to!, carObj!.supplier.priceChangeRate || 0, currentOptions())
                        setBooking(_booking); setPrice(p); setValue('from', date); setFromError(false)
                        if (to && date > to) {
                          setValue('to', undefined)
                        }
                      }
                    }}
                    language={UserService.getLanguage()}
                  />
                </FormControl>
                <FormControl fullWidth size="small">
                  <DateTimePicker
                    label={commonStrings.TO}
                    value={to} minDate={minDate} required
                    onChange={async (date) => {
                      if (date) {
                        const _booking = bookcarsHelper.clone(booking) as bookcarsTypes.Booking
                        _booking.to = date
                        const p = await bookcarsHelper.calculateTotalPrice(carObj!, from!, date, carObj!.supplier.priceChangeRate || 0, currentOptions())
                        setBooking(_booking); setPrice(p); setValue('to', date); setToError(false)
                      }
                    }}
                    language={UserService.getLanguage()}
                  />
                </FormControl>
              </div>

              <FormControl fullWidth size="small">
                <StatusList
                  label={blStrings.STATUS}
                  value={status}
                  onChange={(value) => {
                    if (status !== value) {
                      setValue('status', value)
                    }
                  }}
                  required
                />
              </FormControl>

              <div className="switches-list">
                {[
                  { field: 'cancellation', label: csStrings.CANCELLATION, value: cancellation },
                  { field: 'amendments', label: csStrings.AMENDMENTS, value: amendments },
                  { field: 'theftProtection', label: csStrings.THEFT_PROTECTION, value: theftProtection },
                  { field: 'collisionDamageWaiver', label: csStrings.COLLISION_DAMAGE_WAVER, value: collisionDamageWaiver },
                  { field: 'fullInsurance', label: csStrings.FULL_INSURANCE, value: fullInsurance },
                  { field: 'additionalDriver', label: csStrings.ADDITIONAL_DRIVER, value: additionalDriver },
                ].map(({ field, label, value }) => (
                  <FormControl key={field} fullWidth className="switch-item">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={value}
                          color="primary"
                          size="small"
                          disabled={!carObj || !helper.carOptionAvailable(carObj, field as any)}
                          onChange={makeToggle(field as any)}
                        />
                      }
                      label={<span>{label}</span>}
                    />
                  </FormControl>
                ))}
              </div>

              {carObj && helper.carOptionAvailable(carObj, 'additionalDriver') && additionalDriver && (
                <div className="additional-driver-nested">
                  <AdditionalDriverForm
                    control={control} register={register} errors={errors}
                    clearErrors={clearErrors} trigger={trigger}
                    setValue={setValue} language={language}
                  />
                </div>
              )}

              <div className="buttons-group">
                <Button variant="contained" className="btn-primary" fullWidth size="large" type="submit" disabled={isSubmitting}>
                  {commonStrings.SAVE}
                </Button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button variant="contained" color="error" fullWidth onClick={handleDelete}>
                    {commonStrings.DELETE}
                  </Button>
                  <Button variant="contained" className="btn-secondary" fullWidth onClick={() => navigate('/')}>
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </div>
            </div>

            {/* ══ COL 2: MEDIO (Vehículo y Acciones) ═══════════════ */}
            <div className="booking-col booking-col-2">
              {days > 0 && (
                <div className="price-card">
                  <span className="p-label">{`Resumen para ${days} días`}</span>
                  <span className="p-value">{bookcarsHelper.formatPrice(price as number, commonStrings.CURRENCY, language)}</span>
                </div>
              )}

              <div className="section-title">Detalles del Vehículo</div>
              <CarList
                className="car-summary-card"
                user={user}
                booking={booking}
                cars={((carObj && [booking.car]) as bookcarsTypes.Car[]) || []}
                language={language}
                hidePrice
              />

              <div className="actions-stack">
                {booking.odooOrderId && (
                  <div className="box-v3">
                    <div className="box-title">Odoo Order</div>
                    <div className="box-row">
                      <span>Status:</span>
                      <span className="tag-green">Confirmed</span>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => window.open(`${env.API_HOST}/api/bookings/purchase-order/${booking._id}`, '_blank')}
                    >
                      Descargar PDF
                    </Button>
                  </div>
                )}

                {(
                  booking.kmOut !== undefined
                  || status === bookcarsTypes.BookingStatus.Deposit
                  || status === bookcarsTypes.BookingStatus.Paid
                  || status === bookcarsTypes.BookingStatus.PaidInFull
                  || status === bookcarsTypes.BookingStatus.Reserved
                ) && (
                    <div className="box-v3">
                      <div className="box-title">
                        {booking.kmOut !== undefined ? '✅ Inspección Finalizada' : 'Registro de Salida'}
                      </div>
                      {booking.kmOut !== undefined ? (
                        <div className="box-details">
                          <div className="box-row">
                            <span>Kilometraje:</span>
                            <strong>{booking.kmOut.toLocaleString()} km</strong>
                          </div>
                          <div className="box-row">
                            <span>Combustible:</span>
                            <strong>{booking.fuelOut}%</strong>
                          </div>
                          <Button
                            variant="contained"
                            className="btn-primary"
                            size="small"
                            fullWidth
                            onClick={() => window.open(`/admin/checkout-report?b=${booking._id}`, '_blank')}
                            style={{ marginTop: 8 }}
                          >
                            Ver Reporte
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="contained"
                          className="btn-primary"
                          size="medium"
                          fullWidth
                          onClick={() => window.open(`/admin/checkout_car?b=${booking._id}`, '_blank')}
                        >
                          Iniciar Registro
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* ══ COL 3: DERECHA (Galería Fotográfica) ══════════════ */}
            <div className="booking-col booking-col-3">
              <div className="section-title">{`📸 Galería de Inspección (${booking.picturesOut?.length || 0})`}</div>

              {booking.picturesOut && booking.picturesOut.length > 0 ? (
                <div className="photos-vertical-grid">
                  {booking.picturesOut.map((pic, idx) => {
                    const filename = pic.includes('|') ? pic.split('|')[1] : pic
                    const label = pic.includes('|') ? pic.split('|')[0].replace('photo_', '') : idx
                    const isKm = label === '0' || label === 0
                    return (
                      <a key={pic} href={`${env.CDN_CARS}/${filename}`} target="_blank" rel="noreferrer" className="photo-item">
                        <img src={`${env.CDN_CARS}/${filename}`} alt={`Inspección ${label}`} title={`Click para ampliar - ${label}`} />
                        <span className="chk-label">{`chk-${label}${isKm ? 'km' : ''}`}</span>
                      </a>
                    )
                  })}
                </div>
              ) : (
                <div className="no-photos">No hay imágenes disponibles</div>
              )}
            </div>

          </div>
        </form>
      )}

      <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{strings.DELETE_BOOKING}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCancelDelete} variant="contained" className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            {commonStrings.DELETE}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {noMatch && <NoMatch hideHeader />}
      {formError && <Error />}
    </Layout>
  )
}

export default UpdateBooking
