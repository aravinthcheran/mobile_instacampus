import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import Loading from "../../Component/Loading";
import "./index.scss";
import parse from "html-react-parser";
import { Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { apiUrl } from "../../constants";

const Article = ({ match }) => {
	const [articleData, setArticleData] = useState({});
	const [loading, setLoading] = useState(true);
	//const fetchData = async
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
		const apiUrl_article = encodeURI(
			`${apiUrl}/api/v1/article/${match.params.articleId}`
		);
		axios.get(apiUrl_article, axiosConfig).then((res) => {
			setArticleData(res.data.article[0]);
			setLoading(false);
		});
	}, [match.params.articleId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const parseHTMLTags = (str) => {
		str = str
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&");
		return str;
	};

	const parseDate = (str) => {
		let dt = new Date(str);
		return dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
	};
	return (
		<div className="col-12 d-flex justify-content-around article-content my-5">
			{loading ? (
				<Loading />
			) : (
				<div className="flex-self-center col-md-8 article-body">
					<h1 className="content-heading mt-4 mb-1 col-12 text-left">
						{" "}
						{articleData.title}
					</h1>
					<div className="content-author-detail col-12 mb-1 text-left">
						by{" "}
						{articleData.showName ? `${articleData.author.name}` : " AITian "}{" "}
						&nbsp; |&nbsp; {parseDate(articleData.createdAt)} &nbsp; |&nbsp;
						<Link to={`/interview/${articleData.companyName}`}>
							{articleData.companyName}
						</Link>
					</div>
					<div className="tags mb-4 ">
						{articleData.articleTags.map((entity, index_e) => (
							<Badge variant="secondary" key={index_e}>
								{entity}
							</Badge>
						))}
					</div>
					<div className="content-paragraph col-12 text-left article-post">
						{parse(parseHTMLTags(articleData.description))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Article;
