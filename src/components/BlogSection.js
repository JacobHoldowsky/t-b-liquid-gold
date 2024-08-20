import React from 'react';
import './BlogSection.css';

function BlogSection() {
  return (
    <section className="blog-section">
      <h2>Latest from Our Blog</h2>
      <div className="blog-grid">
        <div className="blog-post">
          <img src="/images/blog1.jpg" alt="Blog 1" />
          <h3>Top 5 Honey Pairings for Rosh Hashanah</h3>
          <p>Discover the best foods to pair with our flavored honeys.</p>
        </div>
        <div className="blog-post">
          <img src="/images/blog2.jpg" alt="Blog 2" />
          <h3>The Benefits of Organic Honey</h3>
          <p>Learn about the health benefits of choosing organic honey.</p>
        </div>
        <div className="blog-post">
          <img src="/images/blog3.jpg" alt="Blog 3" />
          <h3>How We Handcraft Our Honey</h3>
          <p>A behind-the-scenes look at our production process.</p>
        </div>
      </div>
    </section>
  );
}

export default BlogSection;
