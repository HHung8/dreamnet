const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User");

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take the information from the form */
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;
    const user = await User.findById();
    const listingPhotos = req.files;
    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.");
    }
    const listingPhotoPaths = listingPhotos.map((file) => file.path);

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });
    await newListing.save();
    res.status(200).json(newListing);
  } catch (err) {
    res
      .status(409)
      .json({ message: "Fail to create Listing", error: err.message });
    console.log(err);
  }
});

/* GET lISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate(
        "creator"
      );
    } else {
      listings = await Listing.find().populate("creator");
    }
    res.status(200).json(listings);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

// GET LISTINGS BY SEARCH
router.get("/search/:search", async (req, res) => {
  const { search } = req.params; // Lấy giá trị của tham số "search" từ URL được truyền vào trong yêu cầu và gán vào biến `search`
  try {
    // Xử lý lỗi trong phần code bên trong. Bất cứ lỗi nào xảy ra trong khối mã bên trong try sẽ được bắt và xử lý trong khối catch
    let listings = []; // Khỏi tạo một mảng rỗng
    // Kiểm tra giá trị của biến Search lấy từ tham số động trong URL. Nếu search là all nghĩa là dùng muốn tìm kiếm tất cả các mục, thì chương trình sẽ thực hiện truy vấn monggoDB  để lấy tata cả các danh sách và lấy dữ liệu của các truờng creator bằng populate
    if (search === "all") {
      listings = await Listing.find().populate("creator");
    } else {
      // Listing.find: Đây là phương thức của monggoose để tìm kiếm các mục trong collection MongoDB được gọi là listing
      listings = await Listing.find({
        // $or: Đây là một toán tử trong MongoDB cho phép xác định một hoặc nhiều điều kiện có thể đúng để tìm kiếm kết quả. Trong trường hợp này, nó chỉ định rằng một trong hai điều kiện được cung cấp dưới dạng mảng bên trong $or có thể đúng.
        $or: [
          // Tìm kiếm các mục mà trường "category" khớp với biểu thức chính quy được chỉ định bởi biến search. Biểu thức chính quy này được sử dụng để tìm kiếm một chuỗi chứa trong trường "category". Tùy chọn $options: "i" là để bật tìm kiếm không phân biệt chữ hoa chữ thường.
          { category: { $regex: search, $options: "i" } },
          //  Tương tự như trên, nhưng tìm kiếm trường "title" thay vì "category".
          { title: { $regex: search, $options: "i" } },
        ],
      }).populate("creator");
    }
    res.status(200).json(listings);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});


/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator");
    res.status(202).json(listing);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Listing can not found!", error: err.message });
  }
});

module.exports = router;
