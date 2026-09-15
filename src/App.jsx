import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabaseClient'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Lecturers from './components/lecturers'
import './App.css'

function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '24px',
          maxWidth: '360px',
          width: '90%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        <p
          style={{
            marginBottom: '20px',
            fontSize: '15px',
            color: '#111827',
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  // ================================
  // STUDENTS
  // ================================

  const [showForm, setShowForm] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [department, setDepartment] = useState('')
  const [matricNumber, setMatricNumber] = useState('')

  const [students, setStudents] = useState([])
  const [showStudents, setShowStudents] = useState(false)

  // ================================
  // RESULTS
  // ================================

  const [courseCode, setCourseCode] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [courseUnit, setCourseUnit] = useState('')
  const [score, setScore] = useState('')
  const [showResultForm, setShowResultForm] = useState(false)

  const getCurrentSession = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const startYear =
      month >= 9 ? year : year - 1

    return `${startYear}/${startYear + 1}`
  }

  const [academicSession, setAcademicSession] =
    useState(getCurrentSession())

  const [semester, setSemester] =
    useState('First Semester')

  const [selectedStudent, setSelectedStudent] =
    useState('')

  const [results, setResults] = useState([])

  // ================================
  // AUTH
  // ================================

  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [resetSent, setResetSent] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [emailUpdateSent, setEmailUpdateSent] =
    useState(false)

  // ================================
  // SETTINGS
  // ================================

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showNewPassword, setShowNewPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [settingsTheme, setSettingsTheme] = useState(
    localStorage.getItem('studentManagerTheme') ||
      'dark'
  )

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      localStorage.getItem(
        'studentManagerNotifications'
      ) !== 'false'
    )

  const [settingsSession, setSettingsSession] =
    useState(
      localStorage.getItem('studentManagerSession') ||
        getCurrentSession()
    )

  const [settingsSemester, setSettingsSemester] =
    useState(
      localStorage.getItem('studentManagerSemester') ||
        'First Semester'
    )

  const [settingsSaved, setSettingsSaved] =
    useState(false)

  // ================================
  // COURSE REGISTRATION
  // ================================

  const [registrations, setRegistrations] = useState([])
  const [regCourseCode, setRegCourseCode] =
    useState('')
  const [regCourseTitle, setRegCourseTitle] =
    useState('')
  const [regCourseUnit, setRegCourseUnit] =
    useState('')
  const [regStudent, setRegStudent] =
    useState('')

  const [checkResultsStudent, setCheckResultsStudent] =
    useState('')

  // ================================
  // CONFIRMATION MODAL
  // ================================

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  })

  const askConfirm = (message, onConfirm) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm,
    })
  }

  const closeConfirm = () => {
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  // ================================
  // COURSE MATERIALS
  // ================================

  const [materials, setMaterials] = useState([])
  const [lecturers, setLecturers] = useState([])

  const [materialLecturer, setMaterialLecturer] =
    useState('')

  const [materialCourseCode, setMaterialCourseCode] =
    useState('')

  const [materialTitle, setMaterialTitle] =
    useState('')

  const [materialLink, setMaterialLink] =
    useState('')

  const [materialFile, setMaterialFile] =
    useState(null)

  const [materialMode, setMaterialMode] =
    useState('upload')

  const [uploading, setUploading] = useState(false)

  const [editingMaterialId, setEditingMaterialId] =
    useState(null)

  const [materialFileInputKey, setMaterialFileInputKey] =
    useState(0)

  const [gpaStudent, setGpaStudent] = useState('')

  // ================================
  // PAGE TITLES
  // ================================

  const pageTitles = {
    dashboard: 'Student Portal',
    profile: 'My Profile',
    courses: 'Course Registration',
    lecturers: 'Lecturers',
    results: 'Check Results',
    standing: 'Academic Standing',
    materials: 'Course Materials',
    settings: 'Settings',
    logout: 'Logout',
  }

  // ================================
  // GREETING
  // ================================

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'

    return 'Good Evening'
  }

  const today = new Date().toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  // ================================
  // NOTIFICATIONS
  // ================================

  const showSuccess = (message) => {
    if (notificationsEnabled) {
      toast.success(message)
    }
  }

  const showError = (message) => {
    if (notificationsEnabled) {
      toast.error(message)
    }
  }

  // ================================
  // DASHBOARD CALCULATIONS
  // ================================

  const departmentCount = new Set(
    students
      .map((student) => student.department)
      .filter(Boolean)
  ).size

  // Combine courses from results and registrations.
  const knownCourses = (() => {
    const courseMap = {}

    ;[...results, ...registrations].forEach((course) => {
      if (!course.course_code) return

      const code = course.course_code
        .trim()
        .toUpperCase()

      if (!courseMap[code]) {
        courseMap[code] = {
          code,
          title: course.course_title || '',
          unit: Number(course.course_unit) || 0,
        }
      }
    })

    return Object.values(courseMap)
  })()

  // ================================
  // ACCURATE GPA CALCULATOR
  // ================================

  const calculateGPA = (resultList) => {
    if (!resultList || resultList.length === 0) {
      return '0.00'
    }

    let totalUnits = 0
    let totalQualityPoints = 0

    resultList.forEach((result) => {
      const unit = Number(result.course_unit) || 0
      const gradePoint =
        Number(result.grade_point) || 0

      if (unit > 0) {
        totalUnits += unit
        totalQualityPoints +=
          gradePoint * unit
      }
    })

    if (totalUnits === 0) {
      return '0.00'
    }

    return (
      totalQualityPoints / totalUnits
    ).toFixed(2)
  }

  const averageGPA = (() => {
    return calculateGPA(results)
  })()

  // ================================
  // AUTHENTICATION
  // ================================

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mounted) {
        setSession(session)
        setAuthLoading(false)
      }
    }

    loadSession()

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (mounted) {
          setSession(newSession)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // ================================
  // LOAD SAVED THEME
  // ================================

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        'studentManagerTheme'
      ) || 'dark'

    document.body.classList.remove(
      'light-theme',
      'dark-theme'
    )

    document.body.classList.add(
      `${savedTheme}-theme`
    )
  }, [])

  // ================================
  // APPLY THEME
  // ================================

  useEffect(() => {
    document.body.classList.remove(
      'light-theme',
      'dark-theme'
    )

    document.body.classList.add(
      `${settingsTheme}-theme`
    )
  }, [settingsTheme])

  // ================================
  // LOAD SAVED ACADEMIC SETTINGS
  // ================================

  useEffect(() => {
    const savedSession =
      localStorage.getItem(
        'studentManagerSession'
      )

    const savedSemester =
      localStorage.getItem(
        'studentManagerSemester'
      )

    if (savedSession) {
      setAcademicSession(savedSession)
    }

    if (savedSemester) {
      setSemester(savedSemester)
    }
  }, [])

  // ================================
  // FETCH DATA
  // ================================

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from('students')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

      const {
        data: resultData,
        error: resultError,
      } = await supabase
        .from('results')
        .select('*')

      const {
        data: regData,
        error: regError,
      } = await supabase
        .from('registrations')
        .select('*')

      const {
        data: materialData,
        error: materialError,
      } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

      const {
        data: lecturerData,
        error: lecturerError,
      } = await supabase
        .from('lecturers')
        .select('*')
        .order('lecturer_name', {
          ascending: true,
        })

      if (studentError) {
        console.error(
          'Error fetching students:',
          studentError
        )
      }

      if (resultError) {
        console.error(
          'Error fetching results:',
          resultError
        )
      }

      if (regError) {
        console.error(
          'Error fetching registrations:',
          regError
        )
      }

      if (materialError) {
        console.error(
          'Error fetching materials:',
          materialError
        )
      }

      if (lecturerError) {
        console.error(
          'Error fetching lecturers:',
          lecturerError
        )
      }

      if (studentData) {
        setStudents(studentData)
      }

      if (resultData) {
        setResults(resultData)
      }

      if (regData) {
        setRegistrations(regData)
      }

      if (materialData) {
        setMaterials(materialData)
      }

      if (lecturerData) {
        setLecturers(lecturerData)
      }
    }

    fetchData()
  }, [])

  // ================================
  // VIEW STUDENTS
  // ================================

  const viewStudents = async () => {
    if (showStudents) {
      setShowStudents(false)
      return
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Error fetching students:',
        error
      )

      showError('Failed to load students')
      return
    }

    setStudents(data || [])
    setShowStudents(true)
  }

  // ================================
  // ADD STUDENT
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanName = studentName.trim()
    const cleanDepartment =
      department.trim()
    const cleanMatricNumber =
      matricNumber.trim()

    if (!cleanName) {
      showError('Please enter the student name')
      return
    }

    if (!cleanDepartment) {
      showError('Please enter the department')
      return
    }

    if (!cleanMatricNumber) {
      showError('Please enter the matric number')
      return
    }

    const {
      data: existingStudent,
      error: checkError,
    } = await supabase
      .from('students')
      .select(
        'id, student_name, matric_number'
      )
      .eq(
        'matric_number',
        cleanMatricNumber
      )
      .maybeSingle()

    if (checkError) {
      console.error(
        'Error checking student:',
        checkError
      )

      showError(
        'Unable to check student information'
      )

      return
    }

    if (existingStudent) {
      showError(
        `Student already exists with matric number ${cleanMatricNumber}`
      )

      return
    }

    const {
      data,
      error,
    } = await supabase
      .from('students')
      .insert([
        {
          student_name: cleanName,
          department: cleanDepartment,
          matric_number:
            cleanMatricNumber,
        },
      ])
      .select()

    if (error) {
      console.error(
        'Error saving student:',
        error
      )

      if (error.code === '23505') {
        showError(
          'Student already exists. This matric number is already registered.'
        )

        return
      }

      showError(
        'Failed to save student: ' +
          error.message
      )

      return
    }

    showSuccess(
      `${cleanName} was added successfully!`
    )

    setStudentName('')
    setDepartment('')
    setMatricNumber('')
    setShowForm(false)

    setStudents((prev) => [
      ...(data || []),
      ...prev,
    ])
  }

  // ================================
  // DELETE STUDENT
  // ================================

  const deleteStudent = async (
    studentId,
    studentName
  ) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (error) {
      console.error(
        'Error deleting student:',
        error
      )

      showError(
        'Failed to delete student: ' +
          error.message
      )

      return
    }

    setStudents((prev) =>
      prev.filter(
        (student) =>
          student.id !== studentId
      )
    )

    showSuccess(
      `${studentName} was deleted successfully!`
    )
  }

  const handleDeleteStudent = (
    studentId,
    studentName
  ) => {
    askConfirm(
      `Are you sure you want to delete ${studentName}?`,
      () => {
        closeConfirm()
        deleteStudent(
          studentId,
          studentName
        )
      }
    )
  }

  // ================================
  // DELETE RESULT
  // ================================

  const deleteResult = async (
    resultId
  ) => {
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', resultId)

    if (error) {
      console.error(
        'Error deleting result:',
        error
      )

      showError(
        'Failed to delete result: ' +
          error.message
      )

      return
    }

    setResults((prev) =>
      prev.filter(
        (result) =>
          result.id !== resultId
      )
    )

    showSuccess(
      'Result deleted successfully!'
    )
  }

  function handleDeleteResult(resultId) {
    askConfirm(
      'Are you sure you want to delete this result?',
      () => {
        closeConfirm()
        deleteResult(resultId)
      }
    )
  }

  // ================================
  // DELETE REGISTRATION
  // ================================

  const deleteRegistration = async (
    registrationId
  ) => {
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', registrationId)

    if (error) {
      console.error(
        'Error deleting registration:',
        error
      )

      showError(
        'Failed to remove registration: ' +
          error.message
      )

      return
    }

    setRegistrations((prev) =>
      prev.filter(
        (registration) =>
          registration.id !==
          registrationId
      )
    )

    showSuccess(
      'Course registration removed successfully!'
    )
  }

  function handleDeleteRegistration(
    registrationId
  ) {
    askConfirm(
      'Are you sure you want to remove this course registration?',
      () => {
        closeConfirm()
        deleteRegistration(
          registrationId
        )
      }
    )
  }

  // ================================
  // DELETE MATERIAL
  // ================================

  const deleteMaterial = async (
    materialId
  ) => {
    const material =
      materials.find(
        (item) =>
          item.id === materialId
      )

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId)

    if (error) {
      console.error(
        'Error deleting material:',
        error
      )

      showError(
        'Failed to delete material: ' +
          error.message
      )

      return
    }

    setMaterials((prev) =>
      prev.filter(
        (item) =>
          item.id !== materialId
      )
    )

    if (
      editingMaterialId === materialId
    ) {
      setEditingMaterialId(null)
      setMaterialCourseCode('')
      setMaterialLecturer('')
      setMaterialTitle('')
      setMaterialLink('')
      setMaterialFile(null)
      setMaterialFileInputKey(
        (prev) => prev + 1
      )
    }

    showSuccess(
      material
        ? `"${material.title}" deleted successfully!`
        : 'Material deleted successfully!'
    )
  }

  function handleDeleteMaterial(
    materialId
  ) {
    askConfirm(
      'Are you sure you want to delete this material?',
      () => {
        closeConfirm()
        deleteMaterial(materialId)
      }
    )
  }

  // ================================
  // ADD RESULT
  // ================================

  const handleResultSubmit = async (e) => {
    e.preventDefault()

    const cleanCourseCode =
      courseCode.trim().toUpperCase()

    const cleanCourseTitle =
      courseTitle.trim()

    const unit = Number(courseUnit)
    const numericScore = Number(score)

    if (!selectedStudent) {
      showError('Please select a student')
      return
    }

    if (!cleanCourseCode) {
      showError('Please enter a course code')
      return
    }

    if (!cleanCourseTitle) {
      showError('Please enter a course title')
      return
    }

    if (!Number.isFinite(unit) || unit <= 0) {
      showError(
        'Course unit must be greater than 0'
      )
      return
    }

    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      showError(
        'Score must be between 0 and 100'
      )
      return
    }

    // Prevent duplicate result for the same
    // student, course and semester.
    const duplicateResult =
      results.find(
        (result) =>
          String(result.student_id) ===
            String(selectedStudent) &&
          String(
            result.course_code
          ).toUpperCase() ===
            cleanCourseCode &&
          String(result.session || '') ===
            `${academicSession} - ${semester}`
      )

    if (duplicateResult) {
      showError(
        'This student already has a result for this course in this semester.'
      )
      return
    }

    let grade = ''
    let gradePoint = 0

    if (numericScore >= 70) {
      grade = 'A'
      gradePoint = 5
    } else if (numericScore >= 60) {
      grade = 'B'
      gradePoint = 4
    } else if (numericScore >= 50) {
      grade = 'C'
      gradePoint = 3
    } else if (numericScore >= 45) {
      grade = 'D'
      gradePoint = 2
    } else if (numericScore >= 40) {
      grade = 'E'
      gradePoint = 1
    } else {
      grade = 'F'
      gradePoint = 0
    }

    const {
      data,
      error,
    } = await supabase
      .from('results')
      .insert([
        {
          student_id: selectedStudent,
          course_code: cleanCourseCode,
          course_title: cleanCourseTitle,
          course_unit: unit,
          score: numericScore,
          grade,
          grade_point: gradePoint,
          session:
            `${academicSession} - ${semester}`,
        },
      ])
      .select()

    if (error) {
      console.error(
        'Error saving result:',
        error
      )

      showError(
        'Failed to save result: ' +
          error.message
      )

      return
    }

    showSuccess(
      'Result added successfully!'
    )

    setResults((prev) => [
      ...(data || []),
      ...prev,
    ])

    setCourseCode('')
    setCourseTitle('')
    setCourseUnit('')
    setScore('')
    setSelectedStudent('')
    setShowResultForm(false)
  }

  // ================================
  // REGISTER COURSE
  // ================================

  const handleRegisterCourse =
    async (e) => {
      e.preventDefault()

      if (!regStudent) {
        showError(
          'Please select a student'
        )
        return
      }

      if (!regCourseCode) {
        showError(
          'Please select a course'
        )
        return
      }

      if (!regCourseUnit) {
        showError(
          'Please select the course unit'
        )
        return
      }

      const alreadyRegistered =
        registrations.some(
          (registration) =>
            String(
              registration.student_id
            ) === String(regStudent) &&
            String(
              registration.course_code
            ).toUpperCase() ===
              String(
                regCourseCode
              ).toUpperCase()
        )

      if (alreadyRegistered) {
        showError(
          'This student is already registered for this course'
        )

        setRegStudent('')
        setRegCourseCode('')
        setRegCourseTitle('')
        setRegCourseUnit('')

        return
      }

      const {
        data,
        error,
      } = await supabase
        .from('registrations')
        .insert([
          {
            student_id: regStudent,
            course_code:
              String(
                regCourseCode
              )
                .trim()
                .toUpperCase(),
            course_title:
              regCourseTitle.trim(),
            course_unit:
              Number(regCourseUnit),
          },
        ])
        .select()

      if (error) {
        console.error(
          'Error registering course:',
          error
        )

        showError(
          `Failed to register course: ${error.message}`
        )

        return
      }

      setRegistrations((prev) => [
        ...prev,
        ...(data || []),
      ])

      showSuccess(
        'Course registered successfully!'
      )

      setRegStudent('')
      setRegCourseCode('')
      setRegCourseTitle('')
      setRegCourseUnit('')
    }

  // ================================
  // EDIT MATERIAL
  // ================================

  const handleEditMaterial = (
    material
  ) => {
    if (!material) return

    setEditingMaterialId(material.id)

    setMaterialCourseCode(
      material.course_code || ''
    )

    setMaterialLecturer(
      material.lecturer_id
        ? String(material.lecturer_id)
        : ''
    )

    setMaterialTitle(
      material.title || ''
    )

    if (
      String(material.file_type || '')
        .toLowerCase() === 'link'
    ) {
      setMaterialMode('link')
      setMaterialLink(
        material.link || ''
      )
    } else {
      setMaterialMode('upload')
      setMaterialLink('')
    }

    // Important:
    // Never keep an old file selected.
    setMaterialFile(null)

    // Force the file input to reset.
    setMaterialFileInputKey(
      (prev) => prev + 1
    )

    // Scroll to form safely.
    setTimeout(() => {
      const form =
        document.querySelector(
          '.material-form'
        )

      if (form) {
        form.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }, 200)
  }

  // ================================
  // ADD / UPDATE MATERIAL
  // ================================

  const handleAddMaterial = async (e) => {
    e.preventDefault()

    if (!materialCourseCode) {
      showError(
        'Please select a course'
      )
      return
    }

    if (!materialLecturer) {
      showError(
        'Please select a lecturer'
      )
      return
    }

    if (!materialTitle.trim()) {
      showError(
        'Please enter a material title'
      )
      return
    }

    const cleanCourseCode =
      materialCourseCode
        .trim()
        .toUpperCase()

    const cleanTitle =
      materialTitle.trim()

    // Find an existing material with the
    // same course + title.
    const duplicate =
      materials.find(
        (material) =>
          String(
            material.course_code || ''
          ).toUpperCase() ===
            cleanCourseCode &&
          String(
            material.title || ''
          )
            .trim()
            .toLowerCase() ===
            cleanTitle.toLowerCase() &&
          material.id !==
            editingMaterialId
      )

    // If editing, use the selected material.
    // If adding a duplicate, update it instead.
    const targetId =
      editingMaterialId ||
      duplicate?.id ||
      null

    setUploading(true)

    try {
      let newLink = ''
      let newFileType = ''

      // =================================
      // UPLOAD MODE
      // =================================

      if (
        materialMode === 'upload'
      ) {
        // When adding a new material,
        // a file is required.
        if (
          !materialFile &&
          !targetId
        ) {
          showError(
            'Please choose a file to upload'
          )
          return
        }

        // When editing, a new file is
        // optional. If no new file is
        // selected, the existing file stays.
        if (materialFile) {
          const fileExt =
            materialFile.name
              .split('.')
              .pop()
              .toLowerCase()

          const safeFileName =
            materialFile.name.replace(
              /[^a-zA-Z0-9._-]/g,
              '_'
            )

          const fileName =
            `${Date.now()}-${safeFileName}`

          const {
            error: uploadError,
          } = await supabase.storage
            .from('materials')
            .upload(
              fileName,
              materialFile
            )

          if (uploadError) {
            console.error(
              'Upload error:',
              uploadError
            )

            showError(
              'Failed to upload file: ' +
                uploadError.message
            )

            return
          }

          const {
            data:
              publicUrlData,
          } =
            supabase.storage
              .from('materials')
              .getPublicUrl(
                fileName
              )

          newLink =
            publicUrlData?.publicUrl ||
            ''

          newFileType =
            fileExt
        }
      }

      // =================================
      // LINK MODE
      // =================================

      if (
        materialMode === 'link'
      ) {
        if (
          !materialLink.trim()
        ) {
          showError(
            'Please paste a link'
          )
          return
        }

        newLink =
          materialLink.trim()

        newFileType = 'link'
      }

      // =================================
      // UPDATE EXISTING MATERIAL
      // =================================

      if (targetId) {
        const payload = {
          course_code:
            cleanCourseCode,
          lecturer_id:
            materialLecturer,
          title: cleanTitle,
        }

        // Only replace the existing
        // file when a new file was
        // actually selected.
        if (
          materialMode ===
            'upload' &&
          materialFile
        ) {
          payload.link = newLink
          payload.file_type =
            newFileType
        }

        // Link mode always updates
        // the link.
        if (
          materialMode === 'link'
        ) {
          payload.link = newLink
          payload.file_type =
            newFileType
        }

        const {
          error,
        } = await supabase
          .from('materials')
          .update(payload)
          .eq('id', targetId)

        if (error) {
          console.error(
            'Update material error:',
            error
          )

          showError(
            'Failed to update material: ' +
              error.message
          )

          return
        }

        // Update the screen immediately
        // after successful database update.
        setMaterials((prev) =>
          prev.map(
            (material) =>
              material.id === targetId
                ? {
                    ...material,
                    ...payload,
                  }
                : material
          )
        )

        showSuccess(
          'Material updated successfully!'
        )
      }

      // =================================
      // ADD NEW MATERIAL
      // =================================

      else {
        const payload = {
          course_code:
            cleanCourseCode,
          lecturer_id:
            materialLecturer,
          title: cleanTitle,
          link: newLink,
          file_type:
            newFileType,
        }

        const {
          data,
          error,
        } = await supabase
          .from('materials')
          .insert([payload])
          .select()
          .single()

        if (error) {
          console.error(
            'Add material error:',
            error
          )

          showError(
            'Failed to add material: ' +
              error.message
          )

          return
        }

        setMaterials((prev) => [
          data,
          ...prev,
        ])

        showSuccess(
          'Material added successfully!'
        )
      }

      // =================================
      // RESET MATERIAL FORM
      // =================================

      setMaterialCourseCode('')
      setMaterialLecturer('')
      setMaterialTitle('')
      setMaterialLink('')
      setMaterialFile(null)
      setMaterialMode('upload')
      setEditingMaterialId(null)

      // This clears the actual
      // browser file input.
      setMaterialFileInputKey(
        (prev) => prev + 1
      )
    } catch (error) {
      console.error(
        'Material error:',
        error
      )

      showError(
        'Something went wrong while processing the material.'
      )
    } finally {
      setUploading(false)
    }
  }

  // ================================
  // SETTINGS FUNCTIONS
  // ================================

  async function handleChangePassword(e) {
    e.preventDefault()

    if (
      !newPassword ||
      !confirmPassword
    ) {
      showError(
        'Please enter both password fields'
      )
      return
    }

    if (newPassword.length < 6) {
      showError(
        'Password must be at least 6 characters'
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      showError(
        'Passwords do not match'
      )
      return
    }

    const {
      error,
    } =
      await supabase.auth.updateUser({
        password: newPassword,
      })

    if (error) {
      console.error(
        'Password update error:',
        error
      )

      showError(
        'Failed to change password: ' +
          error.message
      )

      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)

    showSuccess(
      'Password changed successfully!'
    )
  }

  const saveSettings = () => {
    localStorage.setItem(
      'studentManagerTheme',
      settingsTheme
    )

    localStorage.setItem(
      'studentManagerNotifications',
      String(
        notificationsEnabled
      )
    )

    localStorage.setItem(
      'studentManagerSession',
      settingsSession
    )

    localStorage.setItem(
      'studentManagerSemester',
      settingsSemester
    )

    document.body.classList.remove(
      'light-theme',
      'dark-theme'
    )

    document.body.classList.add(
      `${settingsTheme}-theme`
    )

    setAcademicSession(
      settingsSession
    )

    setSemester(
      settingsSemester
    )

    setSettingsSaved(true)

    if (notificationsEnabled) {
      toast.success(
        'Settings saved successfully!'
      )
    }

    setTimeout(() => {
      setSettingsSaved(false)
    }, 2000)
  }

  function resetSettings() {
    const defaultTheme = 'dark'
    const defaultNotifications = true
    const defaultSession =
      getCurrentSession()
    const defaultSemester =
      'First Semester'

    setSettingsTheme(
      defaultTheme
    )

    setNotificationsEnabled(
      defaultNotifications
    )

    setSettingsSession(
      defaultSession
    )

    setSettingsSemester(
      defaultSemester
    )

    localStorage.setItem(
      'studentManagerTheme',
      defaultTheme
    )

    localStorage.setItem(
      'studentManagerNotifications',
      'true'
    )

    localStorage.setItem(
      'studentManagerSession',
      defaultSession
    )

    localStorage.setItem(
      'studentManagerSemester',
      defaultSemester
    )

    document.body.classList.remove(
      'light-theme',
      'dark-theme'
    )

    document.body.classList.add(
      'dark-theme'
    )

    setAcademicSession(
      defaultSession
    )

    setSemester(
      defaultSemester
    )

    toast.success(
      'Settings restored to default'
    )
  }

  async function handleSettingsLogout() {
    const {
      error,
    } =
      await supabase.auth.signOut()

    if (error) {
      showError(
        'Failed to sign out'
      )
      return
    }

    showSuccess(
      'Signed out successfully'
    )

    setActivePage('dashboard')
  }

  // ================================
  // LOGOUT
  // ================================

  async function handleLogout() {
    await supabase.auth.signOut()
    setActivePage('dashboard')
  }

  // ================================
  // PASSWORD RESET
  // ================================

  const handlePasswordReset =
    async () => {
      if (!session?.user?.email) {
        showError(
          'No account email found'
        )
        return
      }

      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          session.user.email
        )

      if (error) {
        showError(
          'Failed to send reset email: ' +
            error.message
        )
        return
      }

      setResetSent(true)

      showSuccess(
        'Password reset email sent!'
      )
    }

  // ================================
  // EMAIL UPDATE
  // ================================

  const handleEmailUpdate =
    async (e) => {
      e.preventDefault()

      const cleanEmail =
        newEmail
          .trim()
          .toLowerCase()

      if (!cleanEmail) {
        showError(
          'Please enter a new email address'
        )
        return
      }

      if (
        cleanEmail ===
        (
          session?.user?.email ||
          ''
        ).toLowerCase()
      ) {
        showError(
          'This is already your current email'
        )
        return
      }

      const {
        error,
      } =
        await supabase.auth.updateUser({
          email: cleanEmail,
        })

      if (error) {
        console.error(
          'Email update error:',
          error
        )

        showError(
          'Failed to update email: ' +
            error.message
        )

        return
      }

      setEmailUpdateSent(true)
      setNewEmail('')

      showSuccess(
        'Confirmation email sent to your new address!'
      )
    }

  // ================================
  // LOADING / LOGIN
  // ================================

  if (authLoading) {
    return (
      <div className="auth-loading">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <Login
        onLogin={setSession}
      />
    )
  }

  // ================================
  // APP
  // ================================

  return (
    <div className="app-container">

      <Toaster position="top-right" />

      <ConfirmModal
        isOpen={
          confirmState.isOpen
        }
        message={
          confirmState.message
        }
        onConfirm={
          confirmState.onConfirm
        }
        onCancel={
          closeConfirm
        }
      />

      <Sidebar
        isOpen={sidebarOpen}
        activePage={activePage}
        setActivePage={
          setActivePage
        }
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={
          handleLogout
        }
      />

      <div className="main-section">

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          pageTitle={
            pageTitles[
              activePage
            ]
          }
        />

        <main className="main-content">

          {/* ================================
              DASHBOARD
          ================================= */}

          {activePage ===
            'dashboard' && (
            <>

              <div className="dashboard-intro">

                <h1>
                  {getGreeting()},
                  Welcome Back 👋
                </h1>

                <p className="intro-date">
                  {today}
                </p>

                <p className="intro-summary">
                  You currently have{' '}
                  <strong>
                    {students.length}
                  </strong>{' '}
                  student
                  {students.length !== 1
                    ? 's'
                    : ''}{' '}
                  enrolled across{' '}
                  <strong>
                    {departmentCount}
                  </strong>{' '}
                  department
                  {departmentCount !== 1
                    ? 's'
                    : ''},
                  with{' '}
                  <strong>
                    {results.length}
                  </strong>{' '}
                  result
                  {results.length !== 1
                    ? 's'
                    : ''}{' '}
                  recorded so far.
                </p>

              </div>

              <div className="dashboard-header">

                <div>
                  <h1>
                    Dashboard
                  </h1>

                  <p>
                    Welcome back to your school
                    management system.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(true)
                  }
                >
                  Add Student
                </button>

              </div>

              <div className="dashboard-cards">

                <div className="dashboard-card">

                  <div className="card-icon">
                    👨‍🎓
                  </div>

                  <div>
                    <p>
                      Total Students
                    </p>

                    <h2>
                      {students.length}
                    </h2>
                  </div>

                </div>

                <div className="dashboard-card">

                  <div className="card-icon">
                    📊
                  </div>

                  <div>
                    <p>
                      Total Results
                    </p>

                    <h2>
                      {results.length}
                    </h2>
                  </div>

                </div>

                <div className="dashboard-card">

                  <div className="card-icon">
                    🎯
                  </div>

                  <div>
                    <p>
                      Average GPA
                    </p>

                    <h2>
                      {averageGPA}
                    </h2>
                  </div>

                </div>

                <div className="dashboard-card">

                  <div className="card-icon">
                    📈
                  </div>

                  <div>
                    <p>
                      Total Course
                    </p>

                    <h2>
                      {
                        new Set(
                          results
                            .map(
                              (result) =>
                                result.course_code
                            )
                            .filter(Boolean)
                        ).size
                      }
                    </h2>
                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  viewStudents
                }
              >
                {showStudents
                  ? 'Hide Students'
                  : 'View Students'}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowResultForm(
                    true
                  )
                }
              >
                Add Result
              </button>

              {/* ADD RESULT FORM */}

              {showResultForm && (
                <div>

                  <h2>
                    Add Student Result
                  </h2>

                  <form
                    onSubmit={
                      handleResultSubmit
                    }
                  >

                    <select
                      value={
                        selectedStudent
                      }
                      onChange={(e) =>
                        setSelectedStudent(
                          e.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select Student
                      </option>

                      {students.map(
                        (
                          student
                        ) => (
                          <option
                            key={
                              student.id
                            }
                            value={
                              student.id
                            }
                          >
                            {
                              student.student_name
                            }{' '}
                            -{' '}
                            {
                              student.matric_number
                            }
                          </option>
                        )
                      )}

                    </select>

                    <br />
                    <br />

                    <select
                      value={
                        academicSession
                      }
                      onChange={(e) =>
                        setAcademicSession(
                          e.target.value
                        )
                      }
                    >

                      {[0, -1, -2, 1].map(
                        (offset) => {
                          const now =
                            new Date()

                          const year =
                            now.getFullYear()

                          const month =
                            now.getMonth() +
                            1

                          const baseStart =
                            month >= 9
                              ? year
                              : year - 1

                          const startYear =
                            baseStart +
                            offset

                          const label =
                            `${startYear}/${startYear + 1}`

                          return (
                            <option
                              key={
                                label
                              }
                              value={
                                label
                              }
                            >
                              {label}
                            </option>
                          )
                        }
                      )}

                    </select>

                    <br />
                    <br />

                    <select
                      value={semester}
                      onChange={(e) =>
                        setSemester(
                          e.target.value
                        )
                      }
                    >

                      <option value="First Semester">
                        First Semester
                      </option>

                      <option value="Second Semester">
                        Second Semester
                      </option>

                    </select>

                    <br />
                    <br />

                    <input
                      type="text"
                      placeholder="Course Code"
                      value={
                        courseCode
                      }
                      onChange={(e) =>
                        setCourseCode(
                          e.target.value
                        )
                      }
                      required
                    />

                    <br />
                    <br />

                    <input
                      type="text"
                      placeholder="Course Title"
                      value={
                        courseTitle
                      }
                      onChange={(e) =>
                        setCourseTitle(
                          e.target.value
                        )
                      }
                      required
                    />

                    <br />
                    <br />

                    <input
                      type="number"
                      placeholder="Course Unit"
                      value={
                        courseUnit
                      }
                      onChange={(e) =>
                        setCourseUnit(
                          e.target.value
                        )
                      }
                      min="1"
                      required
                    />

                    <br />
                    <br />

                    <input
                      type="number"
                      placeholder="Score"
                      value={score}
                      onChange={(e) =>
                        setScore(
                          e.target.value
                        )
                      }
                      min="0"
                      max="100"
                      required
                    />

                    <br />
                    <br />

                    <button type="submit">
                      Save Result
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowResultForm(false)
                        setSelectedStudent('')
                        setCourseCode('')
                        setCourseTitle('')
                        setCourseUnit('')
                        setScore('')
                      }}
                    >
                      Cancel
                    </button>

                  </form>

                </div>
              )}

              {/* ADD STUDENT FORM */}

              {showForm && (
                <div>

                  <h2>
                    Add New Student
                  </h2>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                  >

                    <input
                      type="text"
                      placeholder="Student Name"
                      value={
                        studentName
                      }
                      onChange={(e) =>
                        setStudentName(
                          e.target.value
                        )
                      }
                      required
                    />

                    <br />
                    <br />

                    <input
                      type="text"
                      placeholder="Department"
                      value={
                        department
                      }
                      onChange={(e) =>
                        setDepartment(
                          e.target.value
                        )
                      }
                      required
                    />

                    <br />
                    <br />

                    <input
                      type="text"
                      placeholder="Matric Number"
                      value={
                        matricNumber
                      }
                      onChange={(e) =>
                        setMatricNumber(
                          e.target.value
                        )
                      }
                      required
                    />

                    <br />
                    <br />

                    <button type="submit">
                      Save Student
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowForm(false)
                      }
                    >
                      Cancel
                    </button>

                  </form>

                </div>
              )}

              {/* STUDENT TABLE */}

              {showStudents && (
                <div>

                  <div className="students-header">

                    <h2>
                      Students
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        setShowStudents(
                          false
                        )
                      }
                    >
                      Close
                    </button>

                  </div>

                  {students.length ===
                  0 ? (
                    <p>
                      No students found.
                    </p>
                  ) : (
                    <table className="students-table">

                      <thead>

                        <tr>
                          <th>S/N</th>
                          <th>
                            Matric Number
                          </th>
                          <th>
                            Name
                          </th>
                          <th>
                            Department
                          </th>
                          <th>
                            Actions
                          </th>
                        </tr>

                      </thead>

                      <tbody>

                        {students.map(
                          (
                            student,
                            index
                          ) => (
                            <tr
                              key={
                                student.id
                              }
                            >

                              <td>
                                {index + 1}
                              </td>

                              <td>
                                {
                                  student.matric_number
                                }
                              </td>

                              <td>
                                {
                                  student.student_name
                                }
                              </td>

                              <td>
                                {
                                  student.department
                                }
                              </td>

                              <td>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteStudent(
                                      student.id,
                                      student.student_name
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>
                  )}

                </div>
              )}

            </>
          )}

          {/* ================================
              PROFILE
          ================================= */}

          {activePage ===
            'profile' && (
            <div className="profile-page">

              <h1>
                My Profile
              </h1>

              <p>
                Your account details.
              </p>

              <div className="profile-card">

                <div className="profile-avatar">
                  {session.user.email
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <table
                  className="students-table"
                  style={{
                    marginBottom:
                      '24px',
                  }}
                >

                  <tbody>

                    <tr>

                      <td
                        style={{
                          fontWeight: 600,
                          color:
                            '#6b7280',
                          width: '40%',
                        }}
                      >
                        Email
                      </td>

                      <td>
                        {
                          session.user.email
                        }
                      </td>

                    </tr>

                    <tr>

                      <td
                        style={{
                          fontWeight: 600,
                          color:
                            '#6b7280',
                        }}
                      >
                        Account Created
                      </td>

                      <td>
                        {session.user.created_at
                          ? new Date(
                              session.user.created_at
                            ).toLocaleDateString(
                              'en-US',
                              {
                                year:
                                  'numeric',
                                month:
                                  'long',
                                day:
                                  'numeric',
                              }
                            )
                          : 'N/A'}
                      </td>

                    </tr>

                    <tr>

                      <td
                        style={{
                          fontWeight: 600,
                          color:
                            '#6b7280',
                        }}
                      >
                        Last Sign In
                      </td>

                      <td>
                        {session.user.last_sign_in_at
                          ? new Date(
                              session.user.last_sign_in_at
                            ).toLocaleDateString(
                              'en-US',
                              {
                                year:
                                  'numeric',
                                month:
                                  'long',
                                day:
                                  'numeric',
                              }
                            )
                          : 'N/A'}
                      </td>

                    </tr>

                    <tr>

                      <td
                        style={{
                          fontWeight: 600,
                          color:
                            '#6b7280',
                        }}
                      >
                        Role
                      </td>

                      <td>
                        Administrator
                      </td>

                    </tr>

                  </tbody>

                </table>

                <button
                  type="button"
                  onClick={
                    handlePasswordReset
                  }
                  disabled={
                    resetSent
                  }
                >
                  {resetSent
                    ? 'Reset Link Sent ✓'
                    : 'Send Password Reset Email'}
                </button>

              </div>

            </div>
          )}

          {/* ================================
              LECTURERS
          ================================= */}

          {activePage ===
            'lecturers' && (
            <Lecturers />
          )}

          {/* ================================
              COURSE REGISTRATION
          ================================= */}

          {activePage ===
            'courses' && (
            <div>

              <h1>
                Course Registration
              </h1>

              <p>
                Register students for
                courses.
              </p>

              <form
                onSubmit={
                  handleRegisterCourse
                }
                style={{
                  marginTop:
                    '20px',
                }}
              >

                <select
                  value={
                    regStudent
                  }
                  onChange={(e) =>
                    setRegStudent(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Student
                  </option>

                  {students.map(
                    (
                      student
                    ) => (
                      <option
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {
                          student.student_name
                        }{' '}
                        -{' '}
                        {
                          student.matric_number
                        }
                      </option>
                    )
                  )}

                </select>

                <br />
                <br />

                <select
                  value={
                    regCourseCode
                  }
                  onChange={(e) => {
                    const selected =
                      knownCourses.find(
                        (course) =>
                          course.code ===
                          e.target.value
                      )

                    setRegCourseCode(
                      e.target.value
                    )

                    setRegCourseTitle(
                      selected
                        ? selected.title
                        : ''
                    )

                    setRegCourseUnit(
                      selected
                        ? selected.unit
                        : ''
                    )
                  }}
                  required
                >

                  <option value="">
                    Select Course
                  </option>

                  {knownCourses.map(
                    (
                      course
                    ) => (
                      <option
                        key={
                          course.code
                        }
                        value={
                          course.code
                        }
                      >
                        {
                          course.code
                        }{' '}
                        -{' '}
                        {
                          course.title
                        }{' '}
                        (
                        {
                          course.unit
                        }{' '}
                        unit
                        {
                          course.unit !==
                          1
                            ? 's'
                            : ''
                        }
                        )
                      </option>
                    )
                  )}

                </select>

                <br />
                <br />

                <button type="submit">
                  Register Course
                </button>

              </form>

              <h2
                style={{
                  marginTop:
                    '30px',
                }}
              >
                Registered Courses
              </h2>

              {registrations.length ===
              0 ? (
                <p>
                  No course
                  registrations yet.
                </p>
              ) : (
                <table className="students-table">

                  <thead>

                    <tr>
                      <th>S/N</th>
                      <th>
                        Student
                      </th>
                      <th>
                        Course Code
                      </th>
                      <th>
                        Course Title
                      </th>
                      <th>
                        Unit
                      </th>
                      <th>
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {registrations.map(
                      (
                        registration,
                        index
                      ) => {

                        const student =
                          students.find(
                            (item) =>
                              String(
                                item.id
                              ) ===
                              String(
                                registration.student_id
                              )
                          )

                        return (
                          <tr
                            key={
                              registration.id
                            }
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td>
                              {student
                                ? student.student_name
                                : 'Unknown'}
                            </td>

                            <td>
                              {
                                registration.course_code
                              }
                            </td>

                            <td>
                              {
                                registration.course_title
                              }
                            </td>

                            <td>
                              {
                                registration.course_unit
                              }
                            </td>

                            <td>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteRegistration(
                                    registration.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>
              )}

            </div>
          )}

          {/* ================================
              CHECK RESULTS
          ================================= */}

          {activePage ===
            'results' && (
            <div>

              <h1>
                Check Results
              </h1>

              <p>
                Select a student to view
                their recorded results.
              </p>

              <select
                value={
                  checkResultsStudent
                }
                onChange={(e) =>
                  setCheckResultsStudent(
                    e.target.value
                  )
                }
                style={{
                  marginTop:
                    '20px',
                  maxWidth:
                    '400px',
                }}
              >

                <option value="">
                  Select Student
                </option>

                {students.map(
                  (
                    student
                  ) => (
                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >
                      {
                        student.student_name
                      }{' '}
                      -{' '}
                      {
                        student.matric_number
                      }
                    </option>
                  )
                )}

              </select>

              {checkResultsStudent && (
                <div
                  style={{
                    marginTop:
                      '25px',
                  }}
                >

                  {(() => {

                    const studentResults =
                      results.filter(
                        (result) =>
                          String(
                            result.student_id
                          ) ===
                          String(
                            checkResultsStudent
                          )
                      )

                    const student =
                      students.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(
                            checkResultsStudent
                          )
                      )

                    if (
                      studentResults.length ===
                      0
                    ) {
                      return (
                        <p>
                          No results found
                          for{' '}
                          {
                            student?.student_name
                          }.
                        </p>
                      )
                    }

                    const totalUnits =
                      studentResults.reduce(
                        (
                          sum,
                          result
                        ) =>
                          sum +
                          (
                            Number(
                              result.course_unit
                            ) || 0
                          ),
                        0
                      )

                    const gpa =
                      calculateGPA(
                        studentResults
                      )

                    return (
                      <>

                        <h2>
                          Results for{' '}
                          {
                            student?.student_name
                          }
                        </h2>

                        <table className="students-table">

                          <thead>

                            <tr>
                              <th>
                                S/N
                              </th>
                              <th>
                                Session
                              </th>
                              <th>
                                Course Code
                              </th>
                              <th>
                                Course Title
                              </th>
                              <th>
                                Unit
                              </th>
                              <th>
                                Score
                              </th>
                              <th>
                                Grade
                              </th>
                              <th>
                                Actions
                              </th>
                            </tr>

                          </thead>

                          <tbody>

                            {studentResults.map(
                              (
                                result,
                                index
                              ) => (
                                <tr
                                  key={
                                    result.id
                                  }
                                >

                                  <td>
                                    {
                                      index +
                                      1
                                    }
                                  </td>

                                  <td>
                                    {
                                      result.session
                                    }
                                  </td>

                                  <td>
                                    {
                                      result.course_code
                                    }
                                  </td>

                                  <td>
                                    {
                                      result.course_title
                                    }
                                  </td>

                                  <td>
                                    {
                                      result.course_unit
                                    }
                                  </td>

                                  <td>
                                    {
                                      result.score
                                    }
                                  </td>

                                  <td>
                                    {
                                      result.grade
                                    }
                                  </td>

                                  <td>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteResult(
                                          result.id
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                          <tfoot>

                            <tr>

                              <td
                                colSpan="4"
                                style={{
                                  textAlign:
                                    'right',
                                  fontWeight:
                                    600,
                                }}
                              >
                                Total Course
                                Unit:
                              </td>

                              <td
                                style={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  totalUnits
                                }
                              </td>

                              <td
                                colSpan="3"
                              ></td>

                            </tr>

                            <tr>

                              <td
                                colSpan="4"
                                style={{
                                  textAlign:
                                    'right',
                                  fontWeight:
                                    600,
                                }}
                              >
                                GPA:
                              </td>

                              <td
                                colSpan="4"
                                style={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {gpa}
                              </td>

                            </tr>

                          </tfoot>

                        </table>

                      </>
                    )
                  })()}

                </div>
              )}

            </div>
          )}

          {/* ================================
              ACADEMIC STANDING
          ================================= */}

          {activePage ===
            'standing' && (
            <div>

              <h1>
                Academic Standing
              </h1>

              <p>
                Select a student to view
                their academic standing.
              </p>

              <select
                value={
                  gpaStudent
                }
                onChange={(e) =>
                  setGpaStudent(
                    e.target.value
                  )
                }
                style={{
                  marginTop:
                    '20px',
                  maxWidth:
                    '400px',
                }}
              >

                <option value="">
                  Select Student
                </option>

                {students.map(
                  (
                    student
                  ) => (
                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >
                      {
                        student.student_name
                      }{' '}
                      -{' '}
                      {
                        student.matric_number
                      }
                    </option>
                  )
                )}

              </select>

              {gpaStudent && (
                <div
                  style={{
                    marginTop:
                      '25px',
                  }}
                >

                  {(() => {

                    const studentResults =
                      results.filter(
                        (result) =>
                          String(
                            result.student_id
                          ) ===
                          String(
                            gpaStudent
                          )
                      )

                    const student =
                      students.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(
                            gpaStudent
                          )
                      )

                    if (
                      studentResults.length ===
                      0
                    ) {
                      return (
                        <p>
                          No results found
                          for{' '}
                          {
                            student?.student_name
                          }.
                        </p>
                      )
                    }

                    // Group results by session.
                    const bySession = {}

                    studentResults.forEach(
                      (result) => {
                        const sessionName =
                          result.session ||
                          'No Session Recorded'

                        if (
                          !bySession[
                            sessionName
                          ]
                        ) {
                          bySession[
                            sessionName
                          ] = []
                        }

                        bySession[
                          sessionName
                        ].push(result)
                      }
                    )

                    // Extract academic year.
                    const bySessionYear = {}

                    studentResults.forEach(
                      (result) => {
                        const sessionName =
                          result.session ||
                          'No Session Recorded'

                        const sessionYear =
                          sessionName.includes(
                            ' - '
                          )
                            ? sessionName.split(
                                ' - '
                              )[0]
                            : sessionName

                        if (
                          !bySessionYear[
                            sessionYear
                          ]
                        ) {
                          bySessionYear[
                            sessionYear
                          ] = []
                        }

                        bySessionYear[
                          sessionYear
                        ].push(result)
                      }
                    )

                    const semesterOrder =
                      (semesterName) =>
                        semesterName ===
                        'Second Semester'
                          ? 2
                          : 1

                    const sessionYears =
                      Object.keys(
                        bySessionYear
                      )
                        .filter(
                          (year) =>
                            year !==
                            'No Session Recorded'
                        )
                        .sort(
                          (a, b) => {
                            const yearA =
                              parseInt(
                                a.split(
                                  '/'
                                )[0]
                              ) || 0

                            const yearB =
                              parseInt(
                                b.split(
                                  '/'
                                )[0]
                              ) || 0

                            return (
                              yearA -
                              yearB
                            )
                          }
                        )

                    const overallCGPA =
                      calculateGPA(
                        studentResults
                      )

                    const totalUnits =
                      studentResults.reduce(
                        (
                          sum,
                          result
                        ) =>
                          sum +
                          (
                            Number(
                              result.course_unit
                            ) || 0
                          ),
                        0
                      )

                    let standing = ''
                    let standingColor =
                      ''

                    const cgpa =
                      Number(
                        overallCGPA
                      )

                    if (
                      cgpa >= 4.5
                    ) {
                      standing =
                        'First Class'
                      standingColor =
                        '#16a34a'
                    } else if (
                      cgpa >= 3.5
                    ) {
                      standing =
                        'Second Class Upper'
                      standingColor =
                        '#2563eb'
                    } else if (
                      cgpa >= 2.4
                    ) {
                      standing =
                        'Second Class Lower'
                      standingColor =
                        '#d97706'
                    } else if (
                      cgpa >= 1.5
                    ) {
                      standing =
                        'Third Class'
                      standingColor =
                        '#ea580c'
                    } else if (
                      cgpa >= 1.0
                    ) {
                      standing =
                        'Pass'
                      standingColor =
                        '#dc2626'
                    } else {
                      standing =
                        'Probation'
                      standingColor =
                        '#991b1b'
                    }

                    return (
                      <>

                        <h2>
                          {
                            student.student_name
                          }'s Academic
                          Standing
                        </h2>

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(4, minmax(0, 1fr))',
                            gap: '20px',
                            marginTop:
                              '20px',
                            marginBottom:
                              '25px',
                          }}
                        >

                          {sessionYears.map(
                            (
                              sessionYear
                            ) => {

                              const semesterResults =
                                Object.keys(
                                  bySession
                                )
                                  .filter(
                                    (
                                      key
                                    ) =>
                                      key.startsWith(
                                        `${sessionYear} - `
                                      )
                                  )
                                  .sort(
                                    (
                                      a,
                                      b
                                    ) => {
                                      const semA =
                                        semesterOrder(
                                          a.split(
                                            ' - '
                                          )[1]
                                        )

                                      const semB =
                                        semesterOrder(
                                          b.split(
                                            ' - '
                                          )[1]
                                        )

                                      return (
                                        semA -
                                        semB
                                      )
                                    }
                                  )

                              const firstSemesterKey =
                                semesterResults.find(
                                  (
                                    key
                                  ) =>
                                    key.endsWith(
                                      'First Semester'
                                    )
                                )

                              const secondSemesterKey =
                                semesterResults.find(
                                  (
                                    key
                                  ) =>
                                    key.endsWith(
                                      'Second Semester'
                                    )
                                )

                              const firstGPA =
                                firstSemesterKey
                                  ? calculateGPA(
                                      bySession[
                                        firstSemesterKey
                                      ]
                                    )
                                  : null

                              const secondGPA =
                                secondSemesterKey
                                  ? calculateGPA(
                                      bySession[
                                        secondSemesterKey
                                      ]
                                    )
                                  : null

                              const sessionCGPA =
                                calculateGPA(
                                  bySessionYear[
                                    sessionYear
                                  ]
                                )

                              return (
                                <table
                                  key={
                                    sessionYear
                                  }
                                  className="students-table"
                                >

                                  <thead>

                                    <tr>

                                      <th
                                        colSpan="2"
                                      >
                                        {
                                          sessionYear
                                        }{' '}
                                        Session
                                      </th>

                                    </tr>

                                  </thead>

                                  <tbody>

                                    <tr>

                                      <td
                                        style={{
                                          fontWeight:
                                            600,
                                          color:
                                            '#6b7280',
                                        }}
                                      >
                                        First Semester GPA
                                      </td>

                                      <td
                                        style={{
                                          fontWeight:
                                            700,
                                        }}
                                      >
                                        {
                                          firstGPA ??
                                          'N/A'
                                        }
                                      </td>

                                    </tr>

                                    <tr>

                                      <td
                                        style={{
                                          fontWeight:
                                            600,
                                          color:
                                            '#6b7280',
                                        }}
                                      >
                                        Second Semester GPA
                                      </td>

                                      <td
                                        style={{
                                          fontWeight:
                                            700,
                                        }}
                                      >
                                        {
                                          secondGPA ??
                                          'N/A'
                                        }
                                      </td>

                                    </tr>

                                    <tr>

                                      <td
                                        style={{
                                          fontWeight:
                                            600,
                                          color:
                                            '#6b7280',
                                        }}
                                      >
                                        Session CGPA
                                      </td>

                                      <td
                                        style={{
                                          fontWeight:
                                            700,
                                        }}
                                      >
                                        {
                                          sessionCGPA
                                        }
                                      </td>

                                    </tr>

                                  </tbody>

                                </table>
                              )
                            }
                          )}

                        </div>

                        <table
                          className="students-table"
                          style={{
                            maxWidth:
                              '500px',
                          }}
                        >

                          <tbody>

                            <tr>

                              <td
                                style={{
                                  fontWeight:
                                    600,
                                  color:
                                    '#6b7280',
                                }}
                              >
                                Overall CGPA
                                (All Sessions)
                              </td>

                              <td
                                style={{
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  overallCGPA
                                }
                              </td>

                            </tr>

                            <tr>

                              <td
                                style={{
                                  fontWeight:
                                    600,
                                  color:
                                    '#6b7280',
                                }}
                              >
                                Total Units
                                Completed
                              </td>

                              <td>
                                {
                                  totalUnits
                                }
                              </td>

                            </tr>

                            <tr>

                              <td
                                style={{
                                  fontWeight:
                                    600,
                                  color:
                                    '#6b7280',
                                }}
                              >
                                Academic
                                Standing
                              </td>

                              <td
                                style={{
                                  color:
                                    standingColor,
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  standing
                                }
                              </td>

                            </tr>

                          </tbody>

                        </table>

                      </>
                    )
                  })()}

                </div>
              )}

            </div>
          )}

          {/* ================================
              COURSE MATERIALS
          ================================= */}

          {activePage ===
            'materials' && (
            <div>

              <h1>
                Course Materials
              </h1>

              <p>
                Add and browse course
                materials by course code.
              </p>

              <form
                className="material-form"
                onSubmit={
                  handleAddMaterial
                }
                style={{
                  marginTop:
                    '20px',
                }}
              >

                {editingMaterialId && (
                  <div
                    style={{
                      marginBottom:
                        '15px',
                      padding:
                        '12px 15px',
                      borderRadius:
                        '8px',
                      backgroundColor:
                        '#dbeafe',
                      color:
                        '#1e40af',
                      fontWeight:
                        600,
                    }}
                  >
                    ✏️ Editing material.
                    Make your changes and
                    click "Update Material".
                  </div>
                )}

                <select
                  value={
                    materialCourseCode
                  }
                  onChange={(e) =>
                    setMaterialCourseCode(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Course
                  </option>

                  {knownCourses.map(
                    (
                      course
                    ) => (
                      <option
                        key={
                          course.code
                        }
                        value={
                          course.code
                        }
                      >
                        {
                          course.code
                        }{' '}
                        -{' '}
                        {
                          course.title
                        }
                      </option>
                    )
                  )}

                </select>

                <br />
                <br />

                <select
                  value={
                    materialLecturer
                  }
                  onChange={(e) =>
                    setMaterialLecturer(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Lecturer
                  </option>

                  {lecturers.map(
                    (
                      lecturer
                    ) => (
                      <option
                        key={
                          lecturer.id
                        }
                        value={
                          String(
                            lecturer.id
                          )
                        }
                      >
                        {
                          lecturer.lecturer_name
                        }
                      </option>
                    )
                  )}

                </select>

                <br />
                <br />

                <input
                  type="text"
                  placeholder="Title (e.g. Lecture Notes Week 1)"
                  value={
                    materialTitle
                  }
                  onChange={(e) =>
                    setMaterialTitle(
                      e.target.value
                    )
                  }
                  required
                />

                <br />
                <br />

                <div
                  style={{
                    display:
                      'flex',
                    gap: '10px',
                    marginBottom:
                      '14px',
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      setMaterialMode(
                        'upload'
                      )
                    }
                    style={{
                      backgroundColor:
                        materialMode ===
                        'upload'
                          ? '#2563eb'
                          : '#e5e7eb',
                      color:
                        materialMode ===
                        'upload'
                          ? 'white'
                          : '#374151',
                    }}
                  >
                    Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMaterialMode(
                        'link'
                      )
                    }
                    style={{
                      backgroundColor:
                        materialMode ===
                        'link'
                          ? '#2563eb'
                          : '#e5e7eb',
                      color:
                        materialMode ===
                        'link'
                          ? 'white'
                          : '#374151',
                    }}
                  >
                    Paste Link
                  </button>

                </div>

                {materialMode ===
                'upload' ? (
                  <input
                    key={
                      materialFileInputKey
                    }
                    type="file"
                    accept=".pdf,.mp4,.mov,.avi,.jpg,.jpeg,.png,.webp"
                    onChange={(e) =>
                      setMaterialFile(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="Paste link (e.g. Google Drive share link)"
                    value={
                      materialLink
                    }
                    onChange={(e) =>
                      setMaterialLink(
                        e.target.value
                      )
                    }
                  />
                )}

                <br />
                <br />

                <button
                  type="submit"
                  disabled={
                    uploading
                  }
                >
                  {uploading
                    ? editingMaterialId
                      ? 'Updating...'
                      : 'Uploading...'
                    : editingMaterialId
                      ? 'Update Material'
                      : 'Add Material'}
                </button>

                {editingMaterialId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMaterialId(
                        null
                      )
                      setMaterialCourseCode('')
                      setMaterialLecturer('')
                      setMaterialTitle('')
                      setMaterialLink('')
                      setMaterialFile(null)
                      setMaterialMode('upload')
                      setMaterialFileInputKey(
                        (prev) =>
                          prev + 1
                      )
                    }}
                    style={{
                      marginLeft:
                        '10px',
                      backgroundColor:
                        '#6b7280',
                    }}
                  >
                    Cancel Edit
                  </button>
                )}

              </form>

              <h2
                style={{
                  marginTop:
                    '30px',
                }}
              >
                All Materials
              </h2>

              {materials.length ===
              0 ? (
                <p>
                  No materials added
                  yet.
                </p>
              ) : (
                <table className="students-table">

                  <thead>

                    <tr>

                      <th>
                        S/N
                      </th>

                      <th>
                        Course Code
                      </th>

                      <th>
                        Lecturer
                      </th>

                      <th>
                        Title
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Link
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {materials.map(
                      (
                        material,
                        index
                      ) => {

                        const lecturer =
                          lecturers.find(
                            (item) =>
                              String(
                                item.id
                              ) ===
                              String(
                                material.lecturer_id
                              )
                          )

                        return (
                          <tr
                            key={
                              material.id
                            }
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td>
                              {
                                material.course_code
                              }
                            </td>

                            <td>
                              {lecturer
                                ? lecturer.lecturer_name
                                : 'Unknown'}
                            </td>

                            <td>
                              {
                                material.title
                              }
                            </td>

                            <td
                              style={{
                                textTransform:
                                  'uppercase',
                              }}
                            >
                              {
                                material.file_type ||
                                'N/A'
                              }
                            </td>

                            <td>

                              {material.link ? (
                                <a
                                  href={
                                    material.link
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open
                                </a>
                              ) : (
                                <span>
                                  No file/link
                                </span>
                              )}

                            </td>

                            <td>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEditMaterial(
                                    material
                                  )
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMaterial(
                                    material.id
                                  )
                                }
                                style={{
                                  marginLeft:
                                    '8px',
                                  backgroundColor:
                                    '#dc2626',
                                }}
                              >
                                Delete
                              </button>

                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>
              )}

            </div>
          )}

          {/* ================================
              SETTINGS
          ================================= */}

          {activePage ===
            'settings' && (
            <div className="profile-page">

              <h1>
                Settings
              </h1>

              <p>
                Manage your account, security
                and application preferences.
              </p>

              {/* ACCOUNT SETTINGS */}

              <div className="profile-card settings-card">

                <h2>
                  👤 Account Settings
                </h2>

                <div className="profile-row">

                  <span>
                    Current Email
                  </span>

                  <strong>
                    {
                      session.user.email
                    }
                  </strong>

                </div>

                <form
                  onSubmit={
                    handleEmailUpdate
                  }
                  style={{
                    marginTop:
                      '20px',
                  }}
                >

                  <label>
                    Change Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter new email address"
                    value={
                      newEmail
                    }
                    onChange={(e) => {
                      setNewEmail(
                        e.target.value
                      )

                      setEmailUpdateSent(
                        false
                      )
                    }}
                    required
                  />

                  <button
                    type="submit"
                    disabled={
                      !newEmail ||
                      newEmail
                        .trim()
                        .toLowerCase() ===
                        (
                          session.user.email ||
                          ''
                        ).toLowerCase()
                    }
                  >
                    Update Email
                  </button>

                  {emailUpdateSent && (
                    <p className="settings-success">
                      ✓ Confirmation email sent.
                      Check your new email address
                      to complete the change.
                    </p>
                  )}

                </form>

              </div>

              {/* PASSWORD SETTINGS */}

              <div className="profile-card settings-card">

                <h2>
                  🔐 Password & Security
                </h2>

                <form
                  onSubmit={
                    handleChangePassword
                  }
                >

                  <label>
                    New Password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      type={
                        showNewPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Enter new password"
                      value={
                        newPassword
                      }
                      onChange={(e) =>
                        setNewPassword(
                          e.target
                            .value
                        )
                      }
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                      className="password-toggle"
                    >
                      {showNewPassword
                        ? 'Hide'
                        : 'Show'}
                    </button>

                  </div>

                  <label>
                    Confirm New Password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Confirm new password"
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target
                            .value
                        )
                      }
                      minLength="6"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="password-toggle"
                    >
                      {showConfirmPassword
                        ? 'Hide'
                        : 'Show'}
                    </button>

                  </div>

                  <button type="submit">
                    Change Password
                  </button>

                </form>

                <div className="settings-divider"></div>

                <button
                  type="button"
                  onClick={
                    handlePasswordReset
                  }
                  disabled={
                    resetSent
                  }
                >
                  {resetSent
                    ? '✓ Reset Link Sent'
                    : 'Send Password Reset Email'}
                </button>

              </div>

              {/* APPEARANCE */}

              <div className="profile-card settings-card">

                <h2>
                  🎨 Appearance
                </h2>

                <div className="settings-option">

                  <div>
                    <strong>
                      Appearance
                    </strong>

                    <p>
                      Choose between light and
                      dark mode.
                    </p>
                  </div>

                  <div className="theme-toggle-container">

                    <span>
                      ☀️
                    </span>

                    <label className="settings-switch">

                      <input
                        type="checkbox"
                        checked={
                          settingsTheme ===
                          'dark'
                        }
                        onChange={(e) => {
                          const newTheme =
                            e.target.checked
                              ? 'dark'
                              : 'light'

                          setSettingsTheme(
                            newTheme
                          )

                          document.body.classList.remove(
                            'light-theme',
                            'dark-theme'
                          )

                          document.body.classList.add(
                            `${newTheme}-theme`
                          )

                          localStorage.setItem(
                            'studentManagerTheme',
                            newTheme
                          )
                        }}
                      />

                      <span></span>

                    </label>

                    <span>
                      🌙
                    </span>

                  </div>

                </div>

              </div>

              {/* NOTIFICATIONS */}

              <div className="profile-card settings-card">

                <h2>
                  🔔 Notifications
                </h2>

                <div className="settings-option">

                  <div>

                    <strong>
                      App Notifications
                    </strong>

                    <p>
                      Show success and error
                      messages throughout the
                      application.
                    </p>

                  </div>

                  <label className="settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        notificationsEnabled
                      }
                      onChange={(e) => {
                        const enabled =
                          e.target.checked

                        setNotificationsEnabled(
                          enabled
                        )

                        localStorage.setItem(
                          'studentManagerNotifications',
                          String(
                            enabled
                          )
                        )

                        if (enabled) {
                          toast.success(
                            'Notifications enabled'
                          )
                        }
                      }}
                    />

                    <span></span>

                  </label>

                </div>

              </div>

              {/* ACADEMIC PREFERENCES */}

              <div className="profile-card settings-card">

                <h2>
                  🎓 Academic Preferences
                </h2>

                <div className="settings-grid">

                  <div>

                    <label>
                      Default Academic Session
                    </label>

                    <select
                      value={
                        settingsSession
                      }
                      onChange={(e) =>
                        setSettingsSession(
                          e.target.value
                        )
                      }
                    >

                      {[0, -1, -2, 1].map(
                        (
                          offset
                        ) => {

                          const now =
                            new Date()

                          const year =
                            now.getFullYear()

                          const month =
                            now.getMonth() +
                            1

                          const baseStart =
                            month >= 9
                              ? year
                              : year - 1

                          const startYear =
                            baseStart +
                            offset

                          const label =
                            `${startYear}/${startYear + 1}`

                          return (
                            <option
                              key={
                                label
                              }
                              value={
                                label
                              }
                            >
                              {label}
                            </option>
                          )
                        }
                      )}

                    </select>

                  </div>

                  <div>

                    <label>
                      Default Semester
                    </label>

                    <select
                      value={
                        settingsSemester
                      }
                      onChange={(e) =>
                        setSettingsSemester(
                          e.target.value
                        )
                      }
                    >

                      <option value="First Semester">
                        First Semester
                      </option>

                      <option value="Second Semester">
                        Second Semester
                      </option>

                    </select>

                  </div>

                </div>

              </div>

              {/* SAVE SETTINGS */}

              <div className="profile-card settings-card">

                <h2>
                  ⚙️ Application Settings
                </h2>

                <div className="settings-actions">

                  <button
                    type="button"
                    onClick={
                      saveSettings
                    }
                  >
                    {settingsSaved
                      ? '✓ Settings Saved'
                      : 'Save Settings'}
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetSettings
                    }
                  >
                    Restore Defaults
                  </button>

                </div>

              </div>

              {/* SYSTEM INFORMATION */}

              <div className="profile-card settings-card">

                <h2>
                  ℹ️ System Information
                </h2>

                <div className="profile-row">

                  <span>
                    Application
                  </span>

                  <strong>
                    Student Manager
                  </strong>

                </div>

                <div className="profile-row">

                  <span>
                    Version
                  </span>

                  <strong>
                    1.0.0
                  </strong>

                </div>

                <div className="profile-row">

                  <span>
                    Total Students
                  </span>

                  <strong>
                    {students.length}
                  </strong>

                </div>

                <div className="profile-row">

                  <span>
                    Total Results
                  </span>

                  <strong>
                    {results.length}
                  </strong>

                </div>

                <div className="profile-row">

                  <span>
                    Total Courses
                  </span>

                  <strong>
                    {knownCourses.length}
                  </strong>

                </div>

                <div className="profile-row">

                  <span>
                    Total Lecturers
                  </span>

                  <strong>
                    {lecturers.length}
                  </strong>

                </div>

              </div>

              {/* LOGOUT */}

              <div className="profile-card settings-card danger-settings">

                <h2>
                  🚪 Account Actions
                </h2>

                <p>
                  Sign out of your Student
                  Manager account on this
                  device.
                </p>

                <button
                  type="button"
                  onClick={
                    handleSettingsLogout
                  }
                  className="logout-settings-button"
                >
                  Sign Out
                </button>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  )
}

export default App