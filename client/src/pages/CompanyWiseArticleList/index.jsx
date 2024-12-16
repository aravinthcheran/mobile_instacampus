import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import ArticleCard from "../../Component/ArticleCard";
import Loading from "../../Component/Loading";
import "./index.scss";
import { apiUrl } from "../../constants";
const CompanyWiseArticleList = ({ match }) => {
	const [articleList, setArticleList] = useState([]);
	const [loading, setLoading] = useState(true);
	const loadData = useCallback(() => {
		const jsonString = localStorage.getItem("user");
		if (!jsonString) {
			this.props.history.push("/login");
			return;
		}
		const data = JSON.parse(jsonString);
		const token = data.token;

		// Create headers object with Authorization header
		const headers = {
			Authorization: `Bearer ${token}`,
		};
		const axiosConfig = {
			headers: headers,
		};
		const apiUrl_articleList = encodeURI(
			`${apiUrl}/api/v1/article/company/${match.params.companyName}`
		);
		axios.get(apiUrl_articleList, axiosConfig).then((res) => {
			setArticleList(res.data.articles);
			setLoading(false);
		});
	}, [match.params.companyName]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const replaceHTMLTags = (str) => {
		str = str
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			.replace(/&nbsp;/g, " ");
		return str.replace(/<\/?[^>]+(>|$)/g, "");
	};

	return (
		<div className="container mt-4 article-list-container">
			<h4 className="my-4 article-heading">
				Interview experiences of {match.params.companyName}
			</h4>
			<div className="col-12 d-flex flex-wrap article-group">
				{loading ? (
					<Loading />
				) : (
					articleList.map((item, index) => {
						return (
							<div className="col-md-4" key={index}>
								<ArticleCard
									key={index}
									id={item._id}
									title={item.title}
									description={replaceHTMLTags(item.description)}
									name={item.showName ? `${item.author.name}` : " AITian "}
									date={item.createdAt}
									tags={item.articleTags}
								/>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default CompanyWiseArticleList;
