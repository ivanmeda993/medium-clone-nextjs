import React from 'react'
import { Comment } from '../typings'

interface Comments {
  comments: Comment[]
}
const Comments = ({ comments }: Comments) =>
  comments.map((c) => (
    <div key={c._id}>
      <p>
        {c.name}:{c.comment}
      </p>
    </div>
  ))

export default Comments
