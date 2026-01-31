class CreateData < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.text :name,            null: false
      t.text :password_digest, null: false
      t.text :locale
      t.boolean :invalid_flag, null: false

      t.timestamps

      t.index :name, unique: true
      t.index :invalid_flag
    end
  end
end
