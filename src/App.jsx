import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabaseClient'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Lecturers from './components/lecturers'
import './App.css'

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '24px', maxWidth: '360px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <p style={{ marginBottom: '20px', fontSize: '15px', color: '#111827' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onCancel} style={{ backgroundColor: '#e5e7eb', color: '#374151', padding: '8px 16px', borderRadius: '6px', border: 'none' }}>Cancel</button>
          <button onClick={onConfirm} style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const [showForm, setShowForm] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [department, setDepartment] = useState('')
  const [matricNumber, setMatricNumber] = useState('')

  const [students, setStudents] = useState([])
  const [showStudents, setShowStudents] = useState(false)

  const [courseCode, setCourseCode] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [courseUnit, setCourseUnit] = useState('')
  const [score, setScore] = useState('')
  const [showResultForm, setShowResultForm] = useState(false)

  const getCurrentSession = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const startYear = month >= 9 ? year : year - 1
    return `${startYear}/${startYear + 1}`;
  }

  const [academicSession, setAcademicSession] = useState(getCurrentSession())
  const [semester, setSemester] = useState('First Semester')

  const [selectedStudent, setSelectedStudent] = useState('')
  const [results, setResults] = useState([])

  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [resetSent, setResetSent] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [emailUpdateSent, setEmailUpdateSent] = useState(false)

  const [registrations, setRegistrations] = useState([])
  const [regCourseCode, setRegCourseCode] = useState('')
  const [regCourseTitle, setRegCourseTitle] = useState('')
  const [regCourseUnit, setRegCourseUnit] = useState('')
  const [regStudent, setRegStudent] = useState('')

  const [checkResultsStudent, setCheckResultsStudent] = useState('')

  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: () => {} })

  const askConfirm = (message, onConfirm) => {
    setConfirmState({ isOpen: true, message, onConfirm })
  }

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }

  // ================================
  // COURSE MATERIALS
  // ================================

  const [materials, setMaterials] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [materialLecturer, setMaterialLecturer] = useState('')

  const [materialCourseCode, setMaterialCourseCode] = useState('')
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialLink, setMaterialLink] = useState('')
  const [materialFile, setMaterialFile] = useState(null)
  const [materialMode, setMaterialMode] = useState('upload')
  const [uploading, setUploading] = useState(false)

  const [editingMaterialId, setEditingMaterialId] = useState(null)
  const [materialFileInputKey, setMaterialFileInputKey] = useState(0)

  const [gpaStudent, setGpaStudent] = useState('')

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

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'

    return 'Good Evening'
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const departmentCount = new Set(
    students.map((s) => s.department)
  ).size

  const knownCourses = (() => {
    const courseMap = {}

    ;[...results, ...registrations].forEach((r) => {
      if (r.course_code) {
        courseMap[r.course_code] = {
          code: r.course_code,
          title: r.course_title,
          unit: r.course_unit,
        }
      }
    })

    return Object.values(courseMap)
  })()

  const averageGPA = (() => {
    const totalUnits = results.reduce((sum, r) => sum + Number(r.course_unit), 0)
    const totalPoints = results.reduce(
      (sum, r) => sum + Number(r.grade_point) * Number(r.course_unit),
      0
    )
    return totalUnits ? (totalPoints / totalUnits).toFixed(2) : '0.00'
  })()

  // ================================
  // AUTHENTICATION
  // ================================

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ================================
  // FETCH DATA
  // ================================

  useEffect(() => {
    const fetchData = async () => {
      const { data: studentData, error: studentError } =
        await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false })

      const { data: resultData, error: resultError } =
        await supabase
          .from('results')
          .select('*')

      const { data: regData, error: regError } =
        await supabase
          .from('registrations')
          .select('*')

      const { data: materialData, error: materialError } =
        await supabase
          .from('materials')
          .select('*')
          .order('created_at', { ascending: false })

      const { data: lecturerData, error: lecturerError } =
        await supabase
          .from('lecturers')
          .select('*')
          .order('lecturer_name', { ascending: true })

      if (studentError) {
        console.error('Error fetching students:', studentError)
      }

      if (resultError) {
        console.error('Error fetching results:', resultError)
      }

      if (regError) {
        console.error('Error fetching registrations:', regError)
      }

      if (materialError) {
        console.error('Error fetching materials:', materialError)
      }

      if (lecturerError) {
        console.error('Error fetching lecturers:', lecturerError)
      }

      if (studentData) setStudents(studentData)
      if (resultData) setResults(resultData)
      if (regData) setRegistrations(regData)
      if (materialData) setMaterials(materialData)
      if (lecturerData) setLecturers(lecturerData)
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
      return
    }

    setStudents(data)
    setShowStudents(true)
  }

  // ================================
  // ADD STUDENT
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          student_name: studentName,
          department: department,
          matric_number: matricNumber,
        },
      ])
      .select()

    if (error) {
      console.error('Error saving student:', error)
      toast.error('Failed to save student')
      return
    }

    console.log('Student saved:', data)
    toast.success(`${studentName} was added successfully!`)

    setStudentName('')
    setDepartment('')
    setMatricNumber('')
    setShowForm(false)

    setStudents((prev) => [...data, ...prev])
  }

  // ================================
  // DELETE STUDENT
  // ================================

  const deleteStudent = async (studentId, studentName) => {
    const { error } = await supabase.from('students').delete().eq('id', studentId)
    if (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
      return
    }
    setStudents((prev) => prev.filter((s) => s.id !== studentId))
    toast.success(`${studentName} was deleted successfully!`)
  }

  const handleDeleteStudent = (studentId, studentName) => {
    askConfirm(`Are you sure you want to delete ${studentName}?`, () => {
      closeConfirm()
      deleteStudent(studentId, studentName)
    })
  }

  const deleteResult = async (resultId) => {
    const { error } = await supabase.from('results').delete().eq('id', resultId)
    if (error) {
      console.error('Error deleting result:', error)
      toast.error('Failed to delete result')
      return
    }
    setResults((prev) => prev.filter((r) => r.id !== resultId))
    toast.success('Result deleted successfully!')
  }

  function handleDeleteResult(resultId) {
    askConfirm('Are you sure you want to delete this result?', () => {
      closeConfirm()
      deleteResult(resultId)
    })
  }

  const deleteRegistration = async (registrationId) => {
    const { error } = await supabase.from('registrations').delete().eq('id', registrationId)
    if (error) {
      console.error('Error deleting registration:', error)
      toast.error('Failed to remove registration')
      return
    }
    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId))
    toast.success('Course registration removed successfully!')
  }

  function handleDeleteRegistration(registrationId) {
    askConfirm('Are you sure you want to remove this course registration?', () => {
      closeConfirm()
      deleteRegistration(registrationId)
    })
  }

  const deleteMaterial = async (materialId) => {
    const { error } = await supabase.from('materials').delete().eq('id', materialId)
    if (error) {
      console.error('Error deleting material:', error)
      toast.error('Failed to delete material')
      return
    }
    setMaterials((prev) => prev.filter((m) => m.id !== materialId))
    toast.success('Material deleted successfully!')
  }

  function handleDeleteMaterial(materialId) {
    askConfirm('Are you sure you want to delete this material?', () => {
      closeConfirm()
      deleteMaterial(materialId)
    })
  }

  // ================================
  // ADD RESULT
  // ================================

  const handleResultSubmit = async (e) => {
    e.preventDefault()

    let grade = ''
    let gradePoint = 0

    if (score >= 70) {
      grade = 'A'
      gradePoint = 5
    } else if (score >= 60) {
      grade = 'B'
      gradePoint = 4
    } else if (score >= 50) {
      grade = 'C'
      gradePoint = 3
    } else if (score >= 45) {
      grade = 'D'
      gradePoint = 2
    } else if (score >= 40) {
      grade = 'E'
      gradePoint = 1
    } else {
      grade = 'F'
      gradePoint = 0
    }

    const { data, error } = await supabase
      .from('results')
      .insert([
        {
          student_id: selectedStudent,
          course_code: courseCode,
          course_title: courseTitle,
          course_unit: courseUnit,
          score: Number(score),
          grade: grade,
          grade_point: gradePoint,
          session: `${academicSession} - ${semester}`,
        },
      ])
      .select()

    if (error) {
      console.error('Error saving result:', error)
      toast.error('Failed to save result')
      return
    }

    console.log('Result saved:', data)
    toast.success('Result added successfully!')

    setResults((prev) => [...data, ...prev])

    setCourseCode('')
    setCourseTitle('')
    setCourseUnit('')
    setScore('')
    setShowResultForm(false)
  }

  // ================================
  // REGISTER COURSE
  // ================================

  const handleRegisterCourse = async (e) => {
    e.preventDefault()

    if (!regStudent) {
      toast.error('Please select a student')
      return
    }

    if (!regCourseCode) {
      toast.error('Please select a course')
      return
    }

    if (!regCourseUnit) {
      toast.error('Please select the course unit')
      return
    }

    const alreadyRegistered = registrations.some(
     (r) => String(r.student_id) === String(regStudent) && r.course_code === regCourseCode
)
    if (alreadyRegistered) {
      toast.error('This student is already registered for this course')
      setRegStudent('')
      setRegCourseCode('')
      setRegCourseTitle('')
      setRegCourseUnit('')
      
      return
}

    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          student_id: regStudent,
          course_code: regCourseCode,
          course_title: regCourseTitle,
          course_unit: Number(regCourseUnit),
        },
      ])
      .select()

    if (error) {
      console.error('Error registering course:', error)
      toast.error(`Failed to register course: ${error.message}`)
      return
    }

    setRegistrations((prev) => [...prev, ...data])

    toast.success('Course registered successfully!')

    setRegStudent('')
    setRegCourseCode('')
    setRegCourseTitle('')
    setRegCourseUnit('')
  }

  // ================================
  // ADD / UPDATE COURSE MATERIAL
  // ================================

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!materialCourseCode) {
      toast.error("Please select a course")
      return
    }

    if (!materialLecturer) {
      toast.error('Please select a lecturer')
      return
    }

    if (!materialTitle) {
      toast.error('Please enter a material title')
      return
    }

    const duplicate = materials.find(
      (m) =>
        m.course_code === materialCourseCode &&
        m.title.trim().toLowerCase() === materialTitle.trim().toLowerCase() &&
        m.id !== editingMaterialId
    )

    const targetId = editingMaterialId || duplicate?.id || null

    let link = materialLink
    let fileType = 'link'

    if (materialMode === 'upload') {
      if (!materialFile) {
        if (!targetId) {
          toast.error('Please choose a file to upload')
          return
        }
      } else {
        setUploading(true)

        const fileExt = materialFile.name.split('.').pop()
        const fileName = `${Date.now()}-${materialFile.name}`

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(fileName, materialFile)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          toast.error('Failed to upload file: ' + uploadError.message)
          setUploading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(fileName)

        link = publicUrlData.publicUrl
        fileType = fileExt
      }
    } else {
      if (!materialLink) {
        toast.error('Please paste a link')
        return
      }
    }

    const payload = {
      course_code: materialCourseCode,
      lecturer_id: materialLecturer,
      title: materialTitle,
      ...(link ? { link, file_type: fileType } : {}),
    }
    
    if (targetId) {
  const { data, error } = await supabase
    .from('materials')
    .update(payload)
    .eq('id', targetId)
    .select()

  setUploading(false)

  if (error) {
    console.error('Error updating material:', error)
    toast.error('Failed to update material: ' + error.message)
    return
  }

  const updatedMaterial =
    data && data[0]
      ? data[0]
      : { ...materials.find((m) => m.id === targetId), ...payload }

  setMaterials((prev) =>
    prev.map((m) => (m.id === targetId ? updatedMaterial : m))
  )
  toast.success('Material updated successfully!') 
} else  {
      const { data, error } = await supabase
        .from('materials')
        .insert([payload])
        .select()

      setUploading(false)

      if (error) {
        console.error('Error adding material:', error)
        toast.error('Failed to add material: ' + error.message)
        return
      }

      setMaterials((prev) => [...data, ...prev])
      toast.success('Material added successfully!')
    }

    setMaterialCourseCode('')
    setMaterialLecturer('')
    setMaterialTitle('')
    setMaterialLink('')
    setMaterialFile(null)
    setEditingMaterialId(null)
    setMaterialFileInputKey((prev) => prev + 1)
  }

  const handleEditMaterial = (material) => {
    setEditingMaterialId(material.id)
    setMaterialCourseCode(material.course_code)
    setMaterialLecturer(String(material.lecturer_id))
    setMaterialTitle(material.title)
    setMaterialMode(material.file_type === 'link' ? 'link' : 'upload')
    setMaterialLink(material.file_type === 'link' ? material.link : '')
  }

  // ================================
  // LOGOUT
  // ================================

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setActivePage('dashboard')
  }

  // ================================
  // PASSWORD RESET
  // ================================

  const handlePasswordReset = async () => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        session.user.email
      )

    if (error) {
      toast.error('Failed to send reset email')
      return
    }

    setResetSent(true)
  }

  // ================================
  // EMAIL UPDATE
  // ================================

  const handleEmailUpdate = async (e) => {
    e.preventDefault()

    const { error } =
      await supabase.auth.updateUser({
        email: newEmail,
      })

    if (error) {
      toast.error(
        'Failed to update email: ' +
          error.message
      )
      return
    }

    setEmailUpdateSent(true)
    setNewEmail('')
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
    return <Login onLogin={setSession} />
  }

  // ================================
  // APP
  // ================================

  return (
    <div className="app-container">

      <Toaster position="top-right" />
      <ConfirmModal isOpen={confirmState.isOpen} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={closeConfirm} />

      <Sidebar
        isOpen={sidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="main-section">

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          pageTitle={pageTitles[activePage]}
        />

        <main className="main-content">

          {/* ================================
              DASHBOARD
          ================================= */}

          {activePage === 'dashboard' && (
            <>
              <div className="dashboard-intro">

                <h1>
                  {getGreeting()}, Welcome Back 👋
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
                    : ''}
                  , with{' '}
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
                  <h1>Dashboard</h1>
                  <p>
                    Welcome back to your school
                    management system.
                  </p>
                </div>

                <button
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
                    <p>Total Students</p>
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
                    <p>Total Results</p>
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
                    <p>Average GPA</p>
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
                    <p>Total Course</p>
                    <h2>
                      {
                        new Set(
                          results.map(
                            (r) =>
                              r.course_code
                          )
                        ).size
                      }
                    </h2>
                  </div>

                </div>

              </div>

              <button onClick={viewStudents}>
                {showStudents
                  ? 'Hide Students'
                  : 'View Students'}
              </button>

              <button
                onClick={() =>
                  setShowResultForm(true)
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
                      value={selectedStudent}
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
                        (student) => (
                          <option
                            key={student.id}
                            value={student.id}
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
                      value={academicSession}
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
                            now.getMonth() + 1

                          const baseStart =
                            month >= 9
                              ? year
                              : year - 1

                          const startYear =
                            baseStart +
                            offset

                          const label = `${startYear}/${startYear + 1}`

                          return (
                            <option
                              key={label}
                              value={label}
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
                      value={courseCode}
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
                      value={courseTitle}
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
                      value={courseUnit}
                      onChange={(e) =>
                        setCourseUnit(
                          e.target.value
                        )
                      }
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
                      onClick={() =>
                        setShowResultForm(false)
                      }
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
                    onSubmit={handleSubmit}
                  >

                    <input
                      type="text"
                      placeholder="Student Name"
                      value={studentName}
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
                      value={department}
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
                      value={matricNumber}
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
                      onClick={() =>
                        setShowStudents(false)
                      }
                    >
                      Close
                    </button>

                  </div>

                  {students.length === 0 ? (
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
                          <th>Name</th>
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

          {activePage === 'profile' && (
            <div className="profile-page">

              <h1>My Profile</h1>

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
                        {new Date(
                          session.user
                            .created_at
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
                        )}
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
                        {new Date(
                          session.user
                            .last_sign_in_at
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
                        )}
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
                  onClick={
                    handlePasswordReset
                  }
                  disabled={resetSent}
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

          {activePage === 'lecturers' && (
            <Lecturers />
          )}

          {/* ================================
              COURSE REGISTRATION
          ================================= */}

          {activePage === 'courses' && (
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
                  marginTop: '20px',
                }}
              >

                <select
                  value={regStudent}
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
                    (student) => (
                      <option
                        key={student.id}
                        value={student.id}
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
                  value={regCourseCode}
                  onChange={(e) => {
                    const selected =
                      knownCourses.find(
                        (c) =>
                          c.code ===
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
                    (course) => (
                      <option
                        key={course.code}
                        value={course.code}
                      >
                        {course.code} -{' '}
                        {course.title} (
                        {course.unit}{' '}
                        unit
                        {course.unit !== 1
                          ? 's'
                          : ''}
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
                      <th>Student</th>
                      <th>
                        Course Code
                      </th>
                      <th>
                        Course Title
                      </th>
                      <th>Unit</th>
                      <th>
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {registrations.map(
                      (
                        reg,
                        index
                      ) => {

                        const student =
                          students.find(
                            (s) =>
                              s.id ===
                              reg.student_id
                          )

                        return (
                          <tr
                            key={
                              reg.id
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
                                reg.course_code
                              }
                            </td>

                            <td>
                              {
                                reg.course_title
                              }
                            </td>

                            <td>
                              {
                                reg.course_unit
                              }
                            </td>

                            <td>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteRegistration(
                                    reg.id
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

          {activePage === 'results' && (
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
                  (student) => (
                    <option
                      key={student.id}
                      value={student.id}
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
                        (r) =>
                          r.student_id ===
                          Number(
                            checkResultsStudent
                          )
                      )

                    const student =
                      students.find(
                        (s) =>
                          s.id ===
                          Number(
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
                          r
                        ) =>
                          sum +
                          Number(
                            r.course_unit
                          ),
                        0
                      )

                    const totalPoints =
                      studentResults.reduce(
                        (
                          sum,
                          r
                        ) =>
                          sum +
                          Number(
                            r.grade_point
                          ) *
                            Number(
                              r.course_unit
                            ),
                        0
                      )

                    const gpa =
                      totalUnits
                        ? (
                            totalPoints /
                            totalUnits
                          ).toFixed(2)
                        : '0.00'

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
                                {totalUnits}
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

          {activePage === 'standing' && (
            <div>

              <h1>
                Academic Standing
              </h1>

              <p>
                Select a student to view
                their academic standing.
              </p>

              <select
                value={gpaStudent}
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
                  (student) => (
                    <option
                      key={student.id}
                      value={student.id}
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
                        (r) =>
                          r.student_id ===
                          Number(
                            gpaStudent
                          )
                      )

                    const student =
                      students.find(
                        (s) =>
                          s.id ===
                          Number(
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

                    const calcGPA = (
                      list
                    ) => {

                      const totalUnits =
                        list.reduce(
                          (
                            sum,
                            r
                          ) =>
                            sum +
                            Number(
                              r.course_unit
                            ),
                          0
                        )

                      const totalPoints =
                        list.reduce(
                          (
                            sum,
                            r
                          ) =>
                            sum +
                            Number(
                              r.grade_point
                            ) *
                              Number(
                                r.course_unit
                              ),
                          0
                        )

                      return totalUnits
                        ? (
                            totalPoints /
                            totalUnits
                          ).toFixed(2)
                        : '0.00'
                    }

                    const semesterOrder =
                      (semesterPart) =>
                        semesterPart ===
                        'Second Semester'
                          ? 2
                          : 1

                    const bySemester = {}

                    studentResults.forEach(
                      (r) => {

                        const key =
                          r.session ||
                          'No Session Recorded'

                        if (
                          !bySemester[
                            key
                          ]
                        ) {
                          bySemester[
                            key
                          ] = []
                        }

                        bySemester[
                          key
                        ].push(r)
                      }
                    )

                    const bySessionYear = {}

                    studentResults.forEach(
                      (r) => {

                        const sessionYear =
                          (
                            r.session ||
                            'No Session Recorded'
                          ).split(
                            ' - '
                          )[0]

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
                        ].push(r)
                      }
                    )

                    const sortedSessionYears =
                      Object.keys(
                        bySessionYear
                      ).sort(
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
                      calcGPA(
                        studentResults
                      )

                    const totalUnits =
                      studentResults.reduce(
                        (
                          sum,
                          r
                        ) =>
                          sum +
                          Number(
                            r.course_unit
                          ),
                        0
                      )

                    let standing = ''
                    let standingColor =
                      ''

                    if (
                      overallCGPA >=
                      4.5
                    ) {
                      standing =
                        'First Class'
                      standingColor =
                        '#16a34a'
                    } else if (
                      overallCGPA >=
                      3.5
                    ) {
                      standing =
                        'Second Class Upper'
                      standingColor =
                        '#2563eb'
                    } else if (
                      overallCGPA >=
                      2.4
                    ) {
                      standing =
                        'Second Class Lower'
                      standingColor =
                        '#d97706'
                    } else if (
                      overallCGPA >=
                      1.5
                    ) {
                      standing =
                        'Third Class'
                      standingColor =
                        '#ea580c'
                    } else if (
                      overallCGPA >=
                      1.0
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

                          {sortedSessionYears
                            .filter(
                              (
                                sessionYear
                              ) =>
                                sessionYear !==
                                'No Session Recorded'
                            )
                            .map(
                              (
                                sessionYear
                              ) => {

                                const semesterKeysInSession =
                                  Object.keys(
                                    bySemester
                                  ).filter(
                                    (
                                      key
                                    ) =>
                                      key.split(
                                        ' - '
                                      )[0] ===
                                      sessionYear
                                  )

                                semesterKeysInSession.sort(
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

                                const previousSemesterKey =
                                  semesterKeysInSession.length > 1
                                    ? semesterKeysInSession[0]
                                    : null

                                const currentSemesterKey =
                                  semesterKeysInSession.length > 1
                                    ? semesterKeysInSession[1]
                                    : semesterKeysInSession[0]

                                const previousGPA =
                                  previousSemesterKey
                                    ? calcGPA(
                                        bySemester[
                                          previousSemesterKey
                                        ]
                                      )
                                    : null

                                const currentGPA =
                                  currentSemesterKey
                                    ? calcGPA(
                                        bySemester[
                                          currentSemesterKey
                                        ]
                                      )
                                    : null

                                const sessionCGPA =
                                  calcGPA(
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

                                        <th colSpan="2">
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
                                          Previous GPA{' '}
                                          {
                                            previousSemesterKey
                                              ? `(${previousSemesterKey.split(' - ')[1]})`
                                              : ''
                                          }
                                        </td>

                                        <td
                                          style={{
                                            fontWeight:
                                              700,
                                          }}
                                        >
                                          {previousGPA ??
                                            'N/A'}
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
                                          Current GPA{' '}
                                          {
                                            currentSemesterKey
                                              ? `(${currentSemesterKey.split(' - ')[1]})`
                                              : ''
                                          }
                                        </td>

                                        <td
                                          style={{
                                            fontWeight:
                                              700,
                                          }}
                                        >
                                          {currentGPA ??
                                            'N/A'}
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
                                          Overall CGPA
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

          {activePage === 'materials' && (
            <div>

              <h1>
                Course Materials
              </h1>

              <p>
                Add and browse course
                materials by course code.
              </p>

              <form
                onSubmit={
                  handleAddMaterial
                }
                style={{
                  marginTop:
                    '20px',
                }}
              >

                {/* COURSE */}

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
                    (course) => (
                      <option
                        key={
                          course.code
                        }
                        value={
                          course.code
                        }
                      >
                        {course.code} -{' '}
                        {course.title}
                      </option>
                    )
                  )}

                </select>

                <br />
                <br />

                {/* LECTURER */}

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
                    (lecturer) => (
                      <option
                        key={
                          lecturer.id
                        }
                        value={
                          lecturer.id
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

                {/* MATERIAL TITLE */}

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

                {/* UPLOAD / LINK */}

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

                {materialMode === 'upload' ? (
                  <input
                    key={materialFileInputKey}
                    type="file"
                    accept=".pdf,.mp4,.mov,.avi,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setMaterialFile(e.target.files[0])}
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
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : editingMaterialId ? 'Update Material' : 'Add Material'}
                </button>

              </form>

              {/* ALL MATERIALS */}

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

                      <th>S/N</th>

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
                            (l) =>
                              String(
                                l.id
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
                                material.file_type
                              }
                            </td>

                            <td>

                              <a
                                href={
                                  material.link
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open
                              </a>

                            </td>

                            <td>
                              <button
                                type="button"
                                onClick={() => handleEditMaterial(material)}
                              >
                                Edit
                              </button>{' '}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMaterial(
                                    material.id
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
              SETTINGS
          ================================= */}

          {activePage === 'settings' && (
            <div className="profile-page">

              <h1>
                Settings
              </h1>

              <p>
                Manage your account and view
                app information.
              </p>

              <div
                className="profile-card"
                style={{
                  marginBottom:
                    '25px',
                }}
              >

                <h2
                  style={{
                    marginBottom:
                      '16px',
                  }}
                >
                  Account
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

                  <input
                    type="email"
                    placeholder="New email address"
                    value={
                      newEmail
                    }
                    onChange={(e) =>
                      setNewEmail(
                        e.target.value
                      )
                    }
                    required
                  />

                  <br />
                  <br />

                  <button type="submit">
                    Update Email
                  </button>

                  {emailUpdateSent && (
                    <p
                      style={{
                        marginTop:
                          '10px',
                        color:
                          '#16a34a',
                        fontSize:
                          '13px',
                      }}
                    >
                      Confirmation link sent
                      to your new email.
                      Check your inbox to
                      complete the change.
                    </p>
                  )}

                </form>

                <button
                  onClick={
                    handlePasswordReset
                  }
                  disabled={resetSent}
                  style={{
                    marginTop:
                      '16px',
                  }}
                >
                  {resetSent
                    ? 'Reset Link Sent ✓'
                    : 'Send Password Reset Email'}
                </button>

              </div>

              <div className="profile-card">

                <h2
                  style={{
                    marginBottom:
                      '16px',
                  }}
                >
                  About
                </h2>

                <div className="profile-row">

                  <span>
                    App Name
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
                    {
                      students.length
                    }
                  </strong>

                </div>

                <div className="profile-row">

                  <span>
                    Total Results Recorded
                  </span>

                  <strong>
                    {
                      results.length
                    }
                  </strong>

                </div>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  )
}

export default App
