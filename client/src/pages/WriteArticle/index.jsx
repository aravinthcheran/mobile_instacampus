import { Component } from "react";
import "./index.scss";
import ArticleEditor from "../../Component/ArticleEditor";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import InputTags from "../../Component/InputTags";
import OverlayModal from "../../Component/OverlayModal";
import { Prompt } from "react-router-dom";
import FeedbackModal from "../../Component/feedbackModal/index";
import { apiUrl } from "../../constants";

const MySwal = withReactContent(Swal);

export class WriteArticle extends Component {
  state = {
    articleDetails: {
      title: "",
      companyName: "",
      name: "",
      contact: "", // email
      showName: true,
    },
    errors: {
      title: "",
      companyName: "",
      name: "",
      contact: "",
    },
    articleText: "",
    AllTags: ["Interview-experience"],
    formIsHalfFilledOut: false,
    isAnyChange: false,
    showModal: false,
    modalTextStatus: "",
    modalContent: {
      heading: "",
      icon: "",
      text: "",
    },
    isShowPreSubmit: false,
    feedbackshow: false,
    articleIDForFeedback: "",
  };

  handleInputValue = (key) => (e) => {
    const { articleDetails, errors } = this.state;
    articleDetails[key] = e.target.value;
    errors[key] = null;
    this.setState({ articleDetails, errors });
    this.setState({ formIsHalfFilledOut: true });
  };

  handleEditorInputChange = (data) => {
    this.setState({ articleText: data });
    this.setState({ formIsHalfFilledOut: true });
  };

  handleCheckBoxInput = (key) => (e) => {
    const { articleDetails } = this.state;
    articleDetails[key] = e.target.checked;
    this.setState({ articleDetails });
  };

  selectedTags = (tags) => {
    this.setState({ AllTags: tags });
  };

  checkEmptyFields = () => {
    const { articleDetails, errors } = this.state;
    let valid = true;
    for (const val in articleDetails) {
      if (articleDetails[val] === "") {
        errors[val] = `Can't be empty`;
        valid = false;
        window.scrollTo(0, 0);
      }
    }
    this.setState({ errors });
    return valid;
  };

  handlePreSubmit = () => {
    if (this.checkEmptyFields()) {
      MySwal.fire({
        title: "Submit",
        text: "Do you want to submit this article?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, submit it!",
        cancelButtonText: "No, cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          this.handleSubmitForm();
        }
      });
    }
  };

  handleSubmitForm = (e) => {
    const { articleDetails, articleText, AllTags, modalContent } = this.state;
    modalContent["heading"] = "Uploading";
    modalContent["icon"] = "fa-upload";
    modalContent["text"] = "Have patience.....";
    this.setState({ showModal: true }, () => {
      this.setState({ modalContent });
    });

    const jsonString = localStorage.getItem("user");
    if (!jsonString) {
      this.props.history.push("/login");
      return;
    }
    const data = JSON.parse(jsonString);
    const token = data.token;

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      title: articleDetails.title,
      typeOfArticle: "Interview-experience",
      companyName: articleDetails.companyName,
      description: articleText,
      articleTags: AllTags,
      author: {
        name: articleDetails.name,
        contact: articleDetails.contact,
      },
      showName: articleDetails.showName,
    };

    const apiUrl1 = `${apiUrl}/api/v1/article`;

    axios
      .post(apiUrl1, payload, { headers })
      .then((res) => {
        this.setState({ showModal: false, feedbackshow: true }, () => {
          this.setState({ articleIDForFeedback: res.data.article._id });
        });
      })
      .catch((err) => {
        MySwal.fire({
          title: "Error while uploading",
          text: "Sorry for this inconvenience. Kindly retry.",
          icon: "error",
        });
        this.setState({ showModal: false });
      });
  };

  componentDidMount() {
    const jsonString = localStorage.getItem("user");
    if (!jsonString) {
      this.props.history.push("/login");
      return;
    }
    const data = JSON.parse(jsonString);
    const token = data.token;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  render() {
    const { errors } = this.state;
    return (
      <>
        <Prompt
          when={!!this.state.formIsHalfFilledOut}
          message="You have unsaved changes, are you sure you want to leave?"
        />
        <div className="container my-3 px-0 write-article">
          <div className="col-md-8 mx-auto">
            <div>
              <div className="form-group">
                <label htmlFor="exampleFormControlInput1">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleFormControlInput1"
                  required
                  onChange={this.handleInputValue("title")}
                />
                <span>{errors.title}</span>
              </div>
              <div className="row">
                <div className="form-group col">
                  <label htmlFor="exampleFormControlInput2">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleFormControlInput2"
                    required
                    onChange={this.handleInputValue("companyName")}
                  />
                  <span>{errors.companyName}</span>
                </div>
                <div className="form-group col">
                  <label htmlFor="exampleFormControlInput3">Your Name</label>
                  <input
                    type="text"
                    className="articleRequestTextBox form-control"
                    id="exampleFormControlInput3"
                    required
                    onChange={this.handleInputValue("name")}
                  />
                  <span>{errors.name}</span>
                  <div className="form-check show-name-checkbox d-flex">
                    <input
                      type="checkbox"
                      className="form-check-input "
                      checked={this.state.articleDetails.showName}
                      onChange={this.handleCheckBoxInput("showName")}
                      id="showNameCheck"
                    />
                    <label className="form-check-label" htmlFor="showNameCheck">
                      display name with article
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="form-group col">
                  <label htmlFor="exampleFormControlInput4">
                    Email <small> (for verification)</small>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="exampleFormControlInput4"
                    placeholder="college/personal email "
                    required
                    onChange={this.handleInputValue("contact")}
                  />
                  <span>{errors.contact}</span>
                </div>
              </div>
              <label>Share your experience here</label>
              <ArticleEditor handleInputChange={this.handleEditorInputChange} />
              <div className="mt-2">
                <label htmlFor="exampleFormControlInput1">Tags</label>
                <InputTags
                  selectedTags={this.selectedTags}
                  tags={this.state.AllTags}
                />
              </div>
              <button
                type="submit"
                className="col-12 mx-auto btn btn-primary my-2"
                onClick={this.handlePreSubmit}
              >
                Submit
              </button>
            </div>
          </div>
          <OverlayModal
            modalContent={this.state.modalContent}
            show={this.state.showModal}
            onHide={() => {
              this.setState({ showModal: false });
            }}
          />
          <FeedbackModal
            onHide={() => {
              this.setState({ feedbackshow: false });
            }}
            show={this.state.feedbackshow}
            article={this.state.articleIDForFeedback}
          />
        </div>
      </>
    );
  }
}

export default WriteArticle;
