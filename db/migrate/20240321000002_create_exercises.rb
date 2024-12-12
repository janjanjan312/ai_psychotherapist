class CreateExercises < ActiveRecord::Migration[7.0]
  def change
    create_table :exercises do |t|
      t.string :title, null: false
      t.text :content
      t.string :difficulty
      t.timestamps
    end
  end
end 