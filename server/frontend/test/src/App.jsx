import { useState } from 'react'
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
  const navigate = useNavigate()

  const months = ['1월', '2월', '3월', '4월', '5월', '6월']
  const visitors = [120, 190, 300, 500, 240, 350]

  const chartData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'], // X축 레이블
    datasets: [
      {
        label: '월별 방문자 수',
        data: visitors, // 실제 데이터 값
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // 바 색상
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // 범례 위치
      },
      title: {
        display: true,
        text: '상반기 통계 그래프', // 차트 제목
      },
    },
  }

  return (
    <>
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>메인 페이지</h1>
    </div>

    <div style={{ width: '600px', margin: '0 auto', padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>

      <div style={{ width: '600px', margin: '30px auto', padding: '10px', background: '#fff', borderRadius: '8px' }}>
        <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '15px' }}>상세 데이터 목록</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', color: '#333' }}>월</th>
              <th style={{ padding: '10px', color: '#333' }}>방문자 수 (명)</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>{month}</td>
                <td style={{ padding: '10px', color: '#666' }}>{visitors[index].toLocaleString()}명</td>
              </tr>
            ))}
          </tbody>
        </table>
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

  const handleLogin = () => {
    setIsLogin(true)

    if (typeID === '' || typePW === '') {
      alert('아이디와 비밀번호를 모두 입력해 주세요!')
      setIsLogin(false)
      return
    }

    alert(`여기서 서버로 api 요청해야함\nSuccess : 200\nFail : 400\nID: ${typeID}\nPW: ${typePW}`)

    setTimeout(() => {
      navigate('/home')
    }, 5000)
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
