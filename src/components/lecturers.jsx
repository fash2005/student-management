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
        <div className="lecturer-list">
          {lecturers.map((lecturer) => (
            <div className="lecturer-card" key={lecturer.id}>
              <h3>👨‍🏫 {lecturer.lecturer_name}</h3>
              <p>{lecturer.department}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Lecturers