const mongoose = require("mongoose");

const CorpSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      // required: true,
    },
    image: {
      type: [String],
      required: false,
    },
    desc: {
      type: String,
      required: false,
    },
    tier: {
      type: String,
    },
    price: {
      type: String,
    },
    comments: [
      {
        text: {
          type: String,
          // required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          // required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Corp = mongoose.model("Corp", CorpSchema);

module.exports = Corp;

// const mongoose = require("mongoose");

// const CorpSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     amount: {
//       type: String,
//       required: false,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String,
//       required: false,
//     },
//     desc: {
//       type: String,
//       required: true,
//     },
//     tier: {
//       type: String,
//     },
//     price: {
//       type: String,
//     },
//     comments: [
//       {
//         text: {
//           type: String,
//           required: true,
//         },
//         user: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           required: true,
//         },
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Corp = mongoose.model("Corp", CorpSchema);

// module.exports = Corp;
