class Exercise < ActiveRecord::Base
  has_many :user_exercise_records
  has_many :users, through: :user_exercise_records

  validates :title, presence: true
end 