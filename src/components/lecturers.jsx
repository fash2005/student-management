import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Lecturers() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [lecturerName, setLecturerName] = useState('')
  const [department, setDepartment] = useState('')
  const [lecturerType, setLecturerType] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLecturers()
  }, [])

  async function fetchLecturers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('lecturers')
      .select('*')
      .order('lecturer_name', { ascending: true })

    if (error) {
      console.error('Error fetching lecturers:', error)
    } else {
      setLecturers(data || [])
    }

    setLoading(false)
  }

  // Get unique departments from the lecturers table
  const departments = [
    ...new Set(
      lecturers
        .map((lecturer) => lecturer.department)
        .filter(Boolean)
    ),
  ].sort()

  // Get unique lecturer types from the lecturers table
  const lecturerTypes = [
    ...new Set(
      lecturers
        .map((lecturer) => lecturer.lecturer_type)
        .filter(Boolean)
    ),
  ].sort()

  async function handleAddLecturer(e) {
    e.preventDefault()

    if (!lecturerName.trim()) {
      alert('Please enter lecturer name')
      return
    }

    if (!department) {
      alert('Please select a department')
      return
    }

    if (!lecturerType) {
      alert('Please select lecturer type')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('lecturers')
      .insert([
        {
          lecturer_name: lecturerName.trim(),
          department,
          lecturer_type: lecturerType,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error adding lecturer:', error)
      alert('Failed to add lecturer: ' + error.message)
      setSaving(false)
      return
    }

    setLecturers((prev) =>
      [...prev, data].sort((a, b) =>
        a.lecturer_name.localeCompare(b.lecturer_name)
      )
    )

    setLecturerName('')
    setDepartment('')
    setLecturerType('')
    setShowForm(false)

    setSaving(false)

    alert('Lecturer added successfully!')
  }

  return (
    <div className="lecturers-page">

      <div className="lecturers-header">
        <div>
          <h1>Lecturers</h1>
          <p>View and manage the lecturers available in your department.</p>
        </div>

        <button
          className="add-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Lecturer'}
        </button>
      </div>

      {showForm && (
        <form
          className="lecturer-form"
          onSubmit={handleAddLecturer}
        >
          <h2>Add New Lecturer</h2>

          <div className="form-group">
            <label>Lecturer Name</label>

            <input
              type="text"
              placeholder="Enter lecturer name"
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Department</label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">
                Select Department
              </option>

              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lecturer Type</label>

            <select
              value={lecturerType}
              onChange={(e) => setLecturerType(e.target.value)}
            >
              <option value="">
                Select Lecturer Type
              </option>

              {lecturerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="save-lecturer-button"
          >
            {saving ? 'Saving...' : 'Add Lecturer'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading lecturers...</p>
      ) : lecturers.length === 0 ? (
        <p>No lecturers found.</p>
      ) : (
        <div className="lecturer-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>SN</th>
                <th>Name</th>
                <th>Department</th>
                <th>Lecturer Type</th>
              </tr>
            </thead>

            <tbody>
              {lecturers.map((lecturer, index) => (
                <tr key={lecturer.id}>
                  <td>{index + 1}</td>

                  <td>
                    👨‍🏫 {lecturer.lecturer_name}
                  </td>

                  <td>
                    {lecturer.department}
                  </td>

                  <td>
                    {lecturer.lecturer_type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default Lecturers