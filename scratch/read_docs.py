import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(file_path):
    try:
        doc = zipfile.ZipFile(file_path)
        xml_content = doc.read('word/document.xml')
        doc.close()
        tree = ET.XML(xml_content)
        
        NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        PARA = NAMESPACE + 'p'
        TEXT = NAMESPACE + 't'
        
        paragraphs = []
        for paragraph in tree.iter(PARA):
            texts = [node.text for node in paragraph.iter(TEXT) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

docs_dir = r"c:\Copy\Local Disk (H)\Project\Website\antigravity\LabIFP\dokumen"
output_file = r"c:\Copy\Local Disk (H)\Project\Website\antigravity\LabIFP\scratch\docs_output.txt"
with open(output_file, 'w', encoding='utf-8') as f:
    for filename in os.listdir(docs_dir):
        if filename.endswith(".docx"):
            f.write("========================================\n")
            f.write(f"FILE: {filename}\n")
            f.write("========================================\n")
            text = read_docx(os.path.join(docs_dir, filename))
            f.write(text[:2000] + ("\n... [TRUNCATED]" if len(text) > 2000 else ""))
            f.write("\n\n")
