const { Router } = require("express");
const { postsController } = require("../controllers/posts.controller");

const router = Router();

router.post("/Posts", postsController.addPosts);
router.patch("/Posts/:id", postsController.updatePosts);
router.delete("/Posts/:id", postsController.deletePosts);
router.get("/Posts", postsController.getPosts);
router.get("/Posts/:id",postsController.getPostById)
router.get("/Posts/category/:categoryId",postsController.getPostsCategoryId)
router.patch("/Posts/review/:id", postsController.addReviews);

module.exports = router;
