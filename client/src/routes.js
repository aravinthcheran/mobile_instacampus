import AboutCreators from "./pages/AboutCreators";
import Article from "./pages/Article";
import CompanyWiseArticleList from "./pages/CompanyWiseArticleList";
import HomePage from "./pages/HomePage";
import RequestArticle from "./pages/RequestArticle";
import WriteArticle from "./pages/WriteArticle";
import Guidelines from "./pages/Guidelines";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

export const mainRoute = [
	{
		path: "/",
		exact: true,
		component: HomePage,
	},
	{
		path: "/interview/:companyName",
		exact: true,
		component: CompanyWiseArticleList,
	},
	{
		path: "/article/:articleId",
		exact: true,
		component: Article,
	},
	{
		path: "/write",
		exact: true,
		component: WriteArticle,
	},
	{
		path: "/request",
		exact: true,
		component: RequestArticle,
	},
	{
		path: "/developers",
		exact: true,
		component: AboutCreators,
	},
	{
		path: "/guidelines",
		exact: true,
		component: Guidelines,
	},
	{
		path: "/login",
		exact: true,
		component: Login,
	},
	{
		path: "/signup",
		exact: true,
		component: SignUp,
	},
	// {
	//     path:"/video",
	//     exact  :true,
	//     component: VideoAnubhav
	// },
	// {
	//     path:"/story",
	//     exact  :true,
	//     component: OurStory
	// },
];
