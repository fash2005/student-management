import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Lecturers() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLecturers()
  }, [])

  async function fetchLecturers() {
    const { data, error } = await supabase
      .from('lecturers')
      .select('*')
      .order('lecturer_name', { ascending: true })

    if (error) {
      console.error('Error fetching lecturers:', error)
    } else {
      setLecturers(data)
    }

    setLoading(false)
  }

  return (
    <div className="lecturers-page">
      <h1>Lecturers</h1>
      <p>View the lecturers available in your department.</p>

      {loading ? (
        <p>Loading lecturers...</p>
      ) : lecturers.length === 0 ? (
        <p>No lecturers found.</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Name</th>
              <th>Department</th>
              <th>Lecturer Type</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer, index) => (
              <tr key={lecturer.id}>
                <td>{index + 1}</td>
                <td>{lecturer.lecturer_name}</td>
                <td>{lecturer.department}</td>
                <td>{lecturer.lecturer_type || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Lecturers