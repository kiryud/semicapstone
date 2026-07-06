import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function Home() {
  const [labels, setLabels] = useState(null)
  const [units, setUnits] = useState(null)
  const [values, setValues] = useState(null)
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5026/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setLabels(data.chartFieldLabels)
          setUnits(data.chartFieldUnits)
          setValues(data.chartValues.data)

          const rawLabels = data.chartFieldLabels
          const rawUnits = data.chartFieldUnits
          const rawValues = data.chartValues.data

          const targetFields = rawLabels.filter(field => {
            const val = rawValues[field]
            return typeof val === 'number' && val >= 0 && val <= 100
          })

          const dynamicLabels = targetFields.map(field => {
            const unit = rawUnits[field]
            return unit ? `${field} (${unit})` : field
          })

          const dynamicValues = targetFields.map(field => rawValues[field])

          setChartData({
          labels: dynamicLabels,
          datasets: [
            {
              label: '장비 상태 (0~100 스케일 그룹)',
              data: dynamicValues,
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',   // 온도: 부드러운 빨간색
                'rgba(54, 162, 235, 0.6)',   // 습도: 부드러운 파란색
                'rgba(75, 192, 192, 0.6)'    // 팬 속도: 부드러운 민트색
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1,
            },
          ],
        });
        } else {
          alert('데이터를 가져오는데 실패했습니다.')
        }
      } catch (error) {
        console.error(error)
        alert('백엔드 서버 연결 상태를 확인해주세요!')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}><h2>데이터를 불러오는 중입니다...</h2></div>
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: '장비 환경 변수 모니터링 (온도/습도/팬)',
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <>
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>메인 페이지</h1>
    </div>

    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',
      gap: '15px',
      width: '100%',
      flexWrap: 'wrap'}}>
      <pre style={{
          flex: 1,
          backgroundColor: '#f4f4f4',
          padding: '15px',
          borderRadius: '5px',
          overflowX: 'auto',
          fontSize: '14px',
          textAlign: 'left',
          lineHeight: '1.5'
        }}>
          {/* null, 2를 넣어줘야 줄바꿈과 2칸 들여쓰기가 적용됩니다 */}
          {JSON.stringify(labels, null, 2)}
      </pre>

      <pre style={{
          flex: 1,
          backgroundColor: '#f4f4f4',
          padding: '15px',
          borderRadius: '5px',
          overflowX: 'auto',
          fontSize: '14px',
          textAlign: 'left',
          lineHeight: '1.5'
        }}>
          {/* null, 2를 넣어줘야 줄바꿈과 2칸 들여쓰기가 적용됩니다 */}
          {JSON.stringify(units, null, 2)}
      </pre>

      <pre style={{
          flex: 1,
          backgroundColor: '#f4f4f4',
          padding: '15px',
          borderRadius: '5px',
          overflowX: 'auto',
          fontSize: '14px',
          textAlign: 'left',
          lineHeight: '1.5'
        }}>
          {/* null, 2를 넣어줘야 줄바꿈과 2칸 들여쓰기가 적용됩니다 */}
          {JSON.stringify(values, null, 2)}
      </pre>
    </div>

    <div style={{ 
      width: '100%', 
      margin: '20px 0', 
      backgroundColor: '#ffffff', 
      padding: '15px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Bar options={options} data={chartData} />
    </div>

    <div>
      <button 
      type="button"
      onClick={() => {navigate('/')}}
      >로그아웃</button>
    </div>
    </>
  )
}

function Login() {
  const [isLogin, setIsLogin] = useState(false)

  const [typeID, setTypeID] = useState('')
  const [typePW, setTypePW] = useState('')

  const navigate = useNavigate()

  const handleLogin = async () => {
    setIsLogin(true)

    if (typeID === '' || typePW === '') {
      alert('아이디와 비밀번호를 모두 입력해 주세요!')
      setIsLogin(false)
      return
    }

    alert(`여기서 서버로 api 요청해야함\nSuccess : 200\nFail : 400\nID: ${typeID}\nPW: ${typePW}`)
    try {
      const response = await fetch('http://localhost:5026/api/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: typeID,
          password: typePW
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message) 
        navigate('/home') // 홈으로 이동
      } else {
        alert(data.message) 
        setIsLogin(false)
      }
    } catch (error) {
      alert('C# 백엔드 서버가 꺼져있거나 주소가 잘못되었습니다!')
      setIsLogin(false)
    }
  }

  return (
    <>
      <section id="center">
        <div>
          <h1>Login</h1>
        </div>
        <div>
          <p>id</p>
          <input 
            type='text' 
            placeholder='Hong Gildong'
            value={typeID}
            onChange={(e) => setTypeID(e.target.value)}
          />
          <p>password</p>
          <input 
            type='password' 
            placeholder='****'
            value={typePW}
            onChange={(e) => setTypePW(e.target.value)}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={isLogin ? null : handleLogin}
          >
            {isLogin ? "Hold on" : "Submit"}
          </button>
        </div>
      </section>

    </>
  )
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/home" element={<Home />}/>
    </Routes>
  )
}

export default App
