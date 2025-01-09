const About = () => {
  return (
    <div className='min-h-screen flex items-center justify-center pb-32'>
      <div className='max-w-2xl mx-auto p-3 text-center'>
        <div>
          <h1 className='text-3xl font-semibold text-center my-7'>
            About Noted
          </h1>
          <div className='text-md text-gray-500 flex flex-col gap-6'>
            <p>
              Welcome to Noted! This platform is designed for students, professionals,
              and anyone who values organized and efficient note-taking. With Noted,
              you can streamline your thoughts, ideas, and tasks into one unified space,
              accessible across the web and terminal. </p>

            <p>
              Noted empowers users with Markdown-based notes, real-time collaboration, and features like version control,
              full-text search, and end-to-end encryption. Whether you are drafting a project plan, jotting down lecture notes,
              or brainstorming ideas, Noted ensures a seamless and secure experience.
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default About