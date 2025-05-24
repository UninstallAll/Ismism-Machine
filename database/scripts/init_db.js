// 切换到数据库
use ismism_machine_db

// 删除已有的集合
db.artworks.drop()
db.artists.drop()
db.art_movements.drop()

// 创建集合
db.createCollection("artworks")
db.createCollection("artists")
db.createCollection("art_movements")

// 创建索引
db.artworks.createIndex({ artist_id: 1 })
db.artworks.createIndex({ movement_id: 1 })
db.artworks.createIndex({ title: "text" })

db.artists.createIndex({ name: 1 })
db.artists.createIndex({ nationality: 1 })

db.art_movements.createIndex({ name: 1 }, { unique: true }) 