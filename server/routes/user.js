const router = require("express").Router()

const Booking = require("../models/Booking")
const User = require("../models/User")
const Listing = require("../models/Listing")

/* GET TRIP LIST */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params
    const trips = await Booking.find({ customerId: userId }).populate("customerId hostId listingId")
    res.status(202).json(trips)
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Can not find trips!", error: err.message })
  }
})

/* ADD LISTING TO WISHLIST */
router.patch("/:userId/:listingId", async (req, res) => {
  // Sử dụng try catch để xử lý lỗi có thể xảy ra trong quá trình thực thi code 
  try {
    const { userId, listingId } = req.params // Lấy userId và listingId từ req.params, đây là các giáy trị được truyền vào trong URL của request
    const user = await User.findById(userId) // Tìm kiếm một User trong đatabase dựa trên userId đã được truyền vào
    const listing = await Listing.findById(listingId).populate("creator") // Tìm kiếm một Listing trong database dựa trên listingId đã được truyền vào và lấy thông tin về creator của listing đó
    const favoriteListing = user.wishList.find((item) => item._id.toString() === listingId) // Kiểm tra xem listing có trong danh sách yêu thích (wishlist) của user hay không

    if (favoriteListing) {
      // Nếu listing đã có trong wishList của user thì loại bỏ listing khỏi wishList
      user.wishList = user.wishList.filter((item) => item._id.toString() !== listingId)
      await user.save() // Lưu lại thay đổi vào database
      res.status(200).json({ message: "Listing is removed from wish list", wishList: user.wishList}) // Gửi phản hồi về cho client với status code 200 và thông báo rằng listing đã được thêm vào wishlist
    } else {
      // Ngược lại nếu không có wishList thì thêm vào
      user.wishList.push(listing) 
      await user.save() // Lưu lại thay đổi vào database
      res.status(200).json({ message: "Listing is added to wish list", wishList: user.wishList}) // Gửi phản hồi về cho client với status code 200 và thông báo rằng listing đã được thêm vào wishlist
    }
  } catch (err) {
    console.log(err)
    res.status(404).json({ error: err.message }) // Nếu lỗi gửi phản hồi về cho client với status code 404 và thông báo lỗi
  }
})

/* GET PROPERTY LIST */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params
    const properties = await Listing.find({ creator: userId }).populate("creator")
    res.status(202).json(properties)
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Can not find properties!", error: err.message })
  }
})

/* GET RESERVATION LIST */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params
    const reservations = await Booking.find({ hostId: userId }).populate("customerId hostId listingId")
    res.status(202).json(reservations)
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Can not find reservations!", error: err.message })
  }
})


module.exports = router