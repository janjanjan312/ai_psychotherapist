class UserExerciseRecord < ActiveRecord::Base
  belongs_to :user
  belongs_to :exercise

  validates :user_id, presence: true
  validates :exercise_id, presence: true
end 