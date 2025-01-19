import { useSelector } from 'react-redux'


const HomePage = () => {
  const user = useSelector(state => state.auth.user)

  if (!user) {
    return (
      <div>
        <h1>Please sign in to view your notes</h1>
      </div>
    )
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  )

}

export default HomePage
