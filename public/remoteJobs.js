const { useState, useEffect } = React;

function RemoteJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    fetch('/api/remote-jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Пагинация
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1>🌎 Remote Project Manager Jobs</h1>
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {currentJobs.map(job => (
              <li key={job.id} style={{
                background: '#fff',
                marginBottom: '16px',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 0 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 8px' }}>{job.position}</h3>
                <p style={{ margin: 0 }}>
                  <strong>{job.company}</strong> | <a href={job.url} target="_blank">View job ↗</a>
                </p>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageClick(i + 1)}
                style={{
                  margin: '0 6px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  background: currentPage === (i + 1) ? '#333' : '#fff',
                  color: currentPage === (i + 1) ? '#fff' : '#333',
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RemoteJobs />);
