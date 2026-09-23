import {
  Droplet,
  Hospital,
  MapPin,
  User,
  ClipboardList,
  Zap,
  Send,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import SectionCard from './SectionCard.jsx'
import FormField from './FormField.jsx'
import ReviewSummary from './ReviewSummary.jsx'
import ConfirmationCard from './ConfirmationCard.jsx'
import { useLanguage } from '../context/useLanguage'
import {
  validateForm,
  validateField,
  todayISO,
} from '../utils/validation.js'
import { BLOOD_GROUPS, GENDERS, REQUEST_TYPES } from '../data/constants.js'
import { districts } from '../data/districts.js'
import {
  fetchAvailability,
  requestOtp,
  submitBloodRequest,
} from '../lib/api.js'

const INITIAL_VALUES = {
  patientName: '',
  patientAge: '',
  gender: '',
  bloodGroup: '',
  units: '',
  requiredDate: '',
  reason: '',
  districtId: '',
  hospitalName: '',
  hospitalAddress: '',
  contact: '',
  requestType: '',
}

export default function BloodRequestForm() {
  const { t, lang } = useLanguage()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submittedRequest, setSubmittedRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [avail, setAvail] = useState(null)
  const [availLoading, setAvailLoading] = useState(false)

  useEffect(() => {
    if (!values.districtId || !values.bloodGroup) {
      return
    }
    let cancelled = false
    async function loadAvailability() {
      setAvailLoading(true)
      try {
        const data = await fetchAvailability(
          values.districtId,
          values.bloodGroup,
          values.units === '' ? undefined : values.units,
        )
        if (!cancelled) setAvail(data)
      } catch {
        if (!cancelled) setAvail(null)
      } finally {
        if (!cancelled) setAvailLoading(false)
      }
    }
    loadAvailability()
    return () => {
      cancelled = true
    }
  }, [values.districtId, values.bloodGroup, values.units])

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function handleBlur(name) {
    const errorKey = validateField(name, values[name])
    setErrors((prev) => {
      const next = { ...prev }
      if (errorKey) next[name] = errorKey
      else delete next[name]
      return next
    })
  }

  function errorOf(name) {
    return errors[name] ? t(errors[name]) : undefined
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSendOtp() {
    const found = validateForm(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setFormError(t('err.formInvalid'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setErrors({})
    setFormError('')
    setOtpError('')
    setSubmitting(true)
    try {
      await requestOtp(String(values.contact).trim())
      setOtpSent(true)
      setOtp('')
      toast.success(t('toast.requestSubmitted') !== 'toast.requestSubmitted' ? t('toast.requestSubmitted') : lang === 'ta' ? 'OTP அனுப்பப்பட்டது' : 'OTP sent to your mobile number')
    } catch (err) {
      const message = err?.message || 'Failed to send OTP'
      setFormError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendOtp() {
    setOtpError('')
    setSubmitting(true)
    try {
      await requestOtp(String(values.contact).trim())
      toast.success(lang === 'ta' ? 'OTP மீண்டும் அனுப்பப்பட்டது' : 'OTP resent')
    } catch (err) {
      const message = err?.message || 'Failed to resend OTP'
      setOtpError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyAndSubmit() {
    const code = String(otp).trim()
    if (!/^\d{6}$/.test(code)) {
      const msg = lang === 'ta' ? '6 இலக்க OTP-ஐ உள்ளிடவும்' : 'Enter the 6-digit OTP'
      setOtpError(msg)
      return
    }
    setOtpError('')
    setFormError('')
    setSubmitting(true)
    try {
      const payload = {
        patientName: String(values.patientName).trim(),
        patientAge: Number(values.patientAge),
        gender: values.gender,
        bloodGroup: values.bloodGroup,
        units: Number(values.units),
        requiredDate: values.requiredDate,
        reason: String(values.reason).trim(),
        districtId: values.districtId,
        hospitalName: String(values.hospitalName).trim(),
        hospitalAddress: String(values.hospitalAddress).trim(),
        contact: String(values.contact).trim(),
        requestType: values.requestType,
      }
      const data = await submitBloodRequest(payload, code)
      const r = data?.request
      setSubmittedRequest({
        id: r.requestId,
        patientName: r.patientName,
        bloodGroup: r.bloodGroup,
        units: r.units,
        districtId: r.districtId,
        hospitalName: r.hospitalName,
        requestType: r.requestType,
        status: r.status || 'submitted',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.success(t('toast.requestSubmitted'))
    } catch (err) {
      const message = err?.message || 'Failed to submit request'
      setFormError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!otpSent) {
      handleSendOtp()
    } else {
      handleVerifyAndSubmit()
    }
  }

  function handleNewRequest() {
    setValues(INITIAL_VALUES)
    setErrors({})
    setFormError('')
    setSubmittedRequest(null)
    setOtp('')
    setOtpSent(false)
    setOtpError('')
    setAvail(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submittedRequest) {
    return (
      <ConfirmationCard request={submittedRequest} onNewRequest={handleNewRequest} />
    )
  }

  const showAvailability =
    Boolean(values.districtId) && Boolean(values.bloodGroup)
  const availableUnits = avail?.available ?? 0
  const isEnough = avail ? Boolean(avail.isAvailable) : false

  let availabilityBadge = null
  if (showAvailability) {
    if (availLoading) {
      availabilityBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          {t('avail.checking')}
        </span>
      )
    } else if (!avail) {
      availabilityBadge = null
    } else if (availableUnits === 0) {
      availabilityBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
          <Droplet className="h-3.5 w-3.5" aria-hidden="true" />
          {t('avail.none')}
        </span>
      )
    } else if (isEnough) {
      availabilityBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {availableUnits} {t('avail.inStock')}
        </span>
      )
    } else {
      availabilityBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
          <Droplet className="h-3.5 w-3.5" aria-hidden="true" />
          {t('avail.shortage')}
        </span>
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="card mb-6 p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {t('form.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t('form.description')}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {t('form.requiredNote')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('form.scrollHint')}
            </span>
          </div>
        </div>
        {formError && (
          <div
            role="alert"
            className="animate-fade-in mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-400"
          >
            {formError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <SectionCard
          id="patient"
          step={1}
          icon={User}
          title={t('section.patient')}
          description={t('section.patientDesc')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField
              label={t('label.patientName')}
              htmlFor="patientName"
              required
              error={errorOf('patientName')}
            >
              <input
                id="patientName"
                name="patientName"
                type="text"
                autoComplete="name"
                className={`input-base ${errors.patientName ? 'input-error' : ''}`}
                placeholder={t('ph.patientName')}
                value={values.patientName}
                onChange={(e) => setField('patientName', e.target.value)}
                onBlur={() => handleBlur('patientName')}
              />
            </FormField>

            <FormField
              label={t('label.patientAge')}
              htmlFor="patientAge"
              required
              error={errorOf('patientAge')}
            >
              <input
                id="patientAge"
                name="patientAge"
                type="number"
                min={0}
                max={120}
                inputMode="numeric"
                className={`input-base ${errors.patientAge ? 'input-error' : ''}`}
                value={values.patientAge}
                onChange={(e) => setField('patientAge', e.target.value)}
                onBlur={() => handleBlur('patientAge')}
              />
            </FormField>

            <FormField
              label={t('label.gender')}
              htmlFor="gender"
              required
              error={errorOf('gender')}
            >
              <select
                id="gender"
                name="gender"
                className={`input-base ${errors.gender ? 'input-error' : ''}`}
                value={values.gender}
                onChange={(e) => setField('gender', e.target.value)}
                onBlur={() => handleBlur('gender')}
              >
                <option value="">{t('ph.selectGender')}</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {t(`gender.${g}`)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </SectionCard>

        <SectionCard
          id="requirement"
          step={2}
          icon={Droplet}
          title={t('section.requirement')}
          description={t('section.requirementDesc')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label={t('label.bloodGroup')}
              htmlFor="bloodGroup"
              required
              error={errorOf('bloodGroup')}
            >
              <select
                id="bloodGroup"
                name="bloodGroup"
                className={`input-base ${errors.bloodGroup ? 'input-error' : ''}`}
                value={values.bloodGroup}
                onChange={(e) => setField('bloodGroup', e.target.value)}
                onBlur={() => handleBlur('bloodGroup')}
              >
                <option value="">{t('ph.selectBloodGroup')}</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label={t('label.units')}
              htmlFor="units"
              required
              error={errorOf('units')}
            >
              <input
                id="units"
                name="units"
                type="number"
                min={1}
                max={50}
                inputMode="numeric"
                className={`input-base ${errors.units ? 'input-error' : ''}`}
                placeholder={t('ph.units')}
                value={values.units}
                onChange={(e) => setField('units', e.target.value)}
                onBlur={() => handleBlur('units')}
              />
            </FormField>

            <FormField
              label={t('label.requiredDate')}
              htmlFor="requiredDate"
              required
              error={errorOf('requiredDate')}
            >
              <input
                id="requiredDate"
                name="requiredDate"
                type="date"
                min={todayISO()}
                className={`input-base ${errors.requiredDate ? 'input-error' : ''}`}
                value={values.requiredDate}
                onChange={(e) => setField('requiredDate', e.target.value)}
                onBlur={() => handleBlur('requiredDate')}
              />
            </FormField>

            <FormField
              label={t('label.reason')}
              htmlFor="reason"
              required
              error={errorOf('reason')}
            >
              <textarea
                id="reason"
                name="reason"
                rows={3}
                className={`input-base resize-y ${errors.reason ? 'input-error' : ''}`}
                placeholder={t('ph.reason')}
                value={values.reason}
                onChange={(e) => setField('reason', e.target.value)}
                onBlur={() => handleBlur('reason')}
              />
            </FormField>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Droplet className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                {t('avail.inlineStock')}
              </span>
              <span key={`${values.districtId}${values.bloodGroup}`} className="animate-fade-in">
                {showAvailability ? (
                  availabilityBadge
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t('avail.mustSelect')}
                  </span>
                )}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="district"
          step={3}
          icon={MapPin}
          title={t('section.district')}
          description={t('section.districtDesc')}
        >
          <FormField
            label={t('label.district')}
            htmlFor="districtId"
            required
            error={errorOf('districtId')}
          >
            <select
              id="districtId"
              name="districtId"
              className={`input-base ${errors.districtId ? 'input-error' : ''}`}
              value={values.districtId}
              onChange={(e) => setField('districtId', e.target.value)}
              onBlur={() => handleBlur('districtId')}
            >
              <option value="">{t('ph.selectDistrict')}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === 'ta' ? d.ta : d.en}
                </option>
              ))}
            </select>
          </FormField>
        </SectionCard>

        <SectionCard
          id="hospital"
          step={4}
          icon={Hospital}
          title={t('section.hospital')}
          description={t('section.hospitalDesc')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label={t('label.hospitalName')}
              htmlFor="hospitalName"
              required
              error={errorOf('hospitalName')}
            >
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                autoComplete="organization"
                className={`input-base ${errors.hospitalName ? 'input-error' : ''}`}
                placeholder={t('ph.hospitalName')}
                value={values.hospitalName}
                onChange={(e) => setField('hospitalName', e.target.value)}
                onBlur={() => handleBlur('hospitalName')}
              />
            </FormField>

            <FormField
              label={t('label.contact')}
              htmlFor="contact"
              required
              error={errorOf('contact')}
            >
              <input
                id="contact"
                name="contact"
                type="tel"
                autoComplete="tel"
                maxLength={10}
                inputMode="numeric"
                className={`input-base ${errors.contact ? 'input-error' : ''}`}
                placeholder={t('ph.contact')}
                value={values.contact}
                onChange={(e) => setField('contact', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('contact')}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                label={t('label.hospitalAddress')}
                htmlFor="hospitalAddress"
                required
                error={errorOf('hospitalAddress')}
              >
                <textarea
                  id="hospitalAddress"
                  name="hospitalAddress"
                  rows={3}
                  className={`input-base resize-y ${
                    errors.hospitalAddress ? 'input-error' : ''
                  }`}
                  placeholder={t('ph.hospitalAddress')}
                  value={values.hospitalAddress}
                  onChange={(e) => setField('hospitalAddress', e.target.value)}
                  onBlur={() => handleBlur('hospitalAddress')}
                />
              </FormField>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="request-type"
          step={5}
          icon={Zap}
          title={t('section.requestType')}
          description={t('section.requestTypeDesc')}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REQUEST_TYPES.map((type) => {
              const selected = values.requestType === type
              return (
                <label
                  key={type}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    selected
                      ? 'border-red-600 bg-red-50/80 dark:border-red-500 dark:bg-red-950/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                  } ${errors.requestType && !selected ? 'ring-1 ring-red-300 dark:ring-red-800' : ''}`}
                >
                  <input
                    type="radio"
                    name="requestType"
                    value={type}
                    checked={selected}
                    onChange={() => setField('requestType', type)}
                    onBlur={() => handleBlur('requestType')}
                    className="mt-1 h-4 w-4 shrink-0 accent-red-600"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                      {type === 'emergency' && (
                        <Zap
                          className="h-4 w-4 text-red-600 dark:text-red-400"
                          aria-hidden="true"
                        />
                      )}
                      {t(`type.${type}`)}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {t(`type.${type}Desc`)}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          {errors.requestType && (
            <p className="animate-fade-in mt-2 text-xs font-medium text-red-600 dark:text-red-400">
              {t(errors.requestType)}
            </p>
          )}
        </SectionCard>

        <SectionCard
          id="review"
          step={6}
          icon={ClipboardList}
          title={t('section.review')}
          description={t('section.reviewDesc')}
        >
          <ReviewSummary
            values={values}
            errors={errors}
            onEditSection={scrollToSection}
          />
          {otpSent && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <FormField
                label={lang === 'ta' ? 'OTP (6 இலக்கம்)' : 'OTP (6-digit code)'}
                htmlFor="otp"
                required
                error={otpError || undefined}
                hint={
                  lang === 'ta'
                    ? `OTP ${values.contact} எண்ணுக்கு அனுப்பப்பட்டது`
                    : `OTP sent to ${values.contact}`
                }
              >
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={`input-base ${otpError ? 'input-error' : ''}`}
                  placeholder={lang === 'ta' ? '6 இலக்க OTP' : 'Enter 6-digit OTP'}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''))
                    if (otpError) setOtpError('')
                  }}
                />
              </FormField>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={submitting}
                  className="btn-secondary w-full px-3 py-2 text-xs sm:w-auto"
                >
                  {lang === 'ta' ? 'OTP-ஐ மீண்டும் அனுப்பு' : 'Resend OTP'}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'ta'
                    ? 'OTP கிடைக்கவில்லையா? மீண்டும் அனுப்பவும்.'
                    : "Didn't receive the OTP? Resend it."}
                </span>
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('form.requiredNote')}
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t('btn.submitting')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {t('btn.submit')}
                </>
              )}
            </button>
          </div>
        </SectionCard>
      </form>
    </div>
  )
}
