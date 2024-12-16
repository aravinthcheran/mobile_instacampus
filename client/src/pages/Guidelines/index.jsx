import React from 'react'
import { Link } from 'react-router-dom'

const Guidelines = () => {
    return (
        <>
            <div className="col-12 col-md-8 mx-auto my-5 bg-white p-1 pl-3">
                <h1 className="mt-4 mb-1 text-align-center">Guidelines</h1>
                <div className="d-lflex flex-column">
                    Community is an experience sharing platform. Anyone from PSGCT can submit their experience which will help others on their way to the next interview.<br/>
                    <br/>
                    <h5><u>Reviewing Process:</u></h5>
                    <ul>
                        <li><b>Step 1</b>: Share your interview experience in <Link to='/write'><u>write-article</u></Link> section.</li>
                        <li><b>Step 2</b>: Submit your article. After submission it will go for verificaiton. Verification is just a small process to filter out spam articles.</li>
                        <li><b>Step 3</b>: After verificaiton it will be available on our platform.</li>
                    </ul>
                    <h5><u>How to write Article:</u></h5>
                    We have made simple and easy to use article writing section. But for better understading regarding its use. One can refer following points.
                    <ol>
                        <li><b> Enter basic information</b>
                        <img width="80%" alt="guidelines/steps" src="/assets/image.png"></img>                        </li>
                        <br/>
                        <li><b> Write article in editor</b> <br/>
                        Editor has mutiple options to ease in wrtiting the articles. Add headings, code-blocks, format-text, emojis, images and many more things.
                        <img width="80%" alt="guidelines/steps" src="/assets/write.png"></img>
                        </li><br/>
                        <li><b> Add tags</b> <br/>
                        <img width="80%" alt="guidelines/steps" src="/assets/Tags.png"></img>
                        </li><br/>
                        <li><b> Submit</b> <br/>
                       click on submit button to send your article for spam check aka verification step. 
                        </li><br/>

                    </ol>

                </div>
                <div className="align-self-center text-center m-2">For any Query/Feedback contact <a href = "mailto:csea.cse@psgtech.ac.in" style={{color:"#87a5ff", textDecoration:"none" , cursor:"pointer"}}>csea.cse@psgtech.ac.in</a></div>

            </div>
        </>
    )
}

export default Guidelines
