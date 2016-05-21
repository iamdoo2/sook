class CreateRankings < ActiveRecord::Migration
  def change
    create_table :rankings do |t|
      t.integer   :elapsedtime,   null: false,  default: 0
      t.string    :username,      null: false,  default: "익명"

      t.timestamps null: false
    end
  end
end
